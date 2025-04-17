import React, { createContext, useContext, useState, useCallback } from 'react';
import userService from '../services/user.service';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const [userFriends, setUserFriends] = useState([]);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));

  // Listen for userEmail changes in localStorage
  React.useEffect(() => {
    const checkEmail = () => {
      const email = localStorage.getItem('userEmail');
      if (email !== userEmail) setUserEmail(email);
    };
    window.addEventListener('storage', checkEmail);
    const interval = setInterval(checkEmail, 500);
    return () => {
      window.removeEventListener('storage', checkEmail);
      clearInterval(interval);
    };
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

  const refreshFriends = useCallback(async (userEmail) => {
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
