import React, { createContext, useContext, useState, useCallback } from 'react';
import userService from '../services/user.service';

const FriendsContext = createContext();

export const FriendsProvider = ({ children, userEmail }) => {
  const [userFriends, setUserFriends] = useState([]);

  // Fetch friends immediately on mount for initial value
  React.useEffect(() => {
    if (!userEmail) return;
    (async () => {
      const user = await userService.getUserByEmail(userEmail);
      if (!user || !user.friends) {
        setUserFriends([]);
        return;
      }
      const friendPromises = user.friends.map(friendEmail => userService.getUserByEmail(friendEmail));
      const friendsData = await Promise.all(friendPromises);
      setUserFriends(friendsData.filter(friend => friend !== null));
    })();
  }, [userEmail]);

  // Real-time Firestore subscription for friends list
  React.useEffect(() => {
    if (!userEmail) return;
    const unsubscribe = userService.subscribeToUserByEmail(userEmail, async (user) => {
      if (!user || !user.friends) {
        setUserFriends([]);
        return;
      }
      // Fetch friend user objects
      const friendPromises = user.friends.map(friendEmail => userService.getUserByEmail(friendEmail));
      const friendsData = await Promise.all(friendPromises);
      setUserFriends(friendsData.filter(friend => friend !== null));
    });
    return () => unsubscribe && unsubscribe();
  }, [userEmail]);

  const refreshFriends = useCallback(async (userEmailOverride) => {
    const emailToUse = userEmailOverride || userEmail;
    if (!emailToUse) return;
    if (!userEmail) return;
    try {
      const user = await userService.getUserByEmail(userEmail);
      if (!user || !user.friends) {
        setUserFriends([]);
        return;
      }
      const friendPromises = user.friends.map(friendEmail => 
        userService.getUserByEmail(friendEmail)
      );
      const friendsData = await Promise.all(friendPromises);
      setUserFriends(friendsData.filter(friend => friend !== null));
    } catch (error) {
      console.error("Error fetching friends:", error);
      setUserFriends([]);
    }
  }, []);

  return (
    <FriendsContext.Provider value={{ userFriends, refreshFriends }}>
      {children}
    </FriendsContext.Provider>
  );
};

export const useFriends = () => useContext(FriendsContext);
