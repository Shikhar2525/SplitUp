import React, { createContext, useContext, useState, useCallback } from 'react';
import userService from '../services/user.service';

const FriendsContext = createContext();

export const FriendsProvider = ({ children }) => {
  const [userFriends, setUserFriends] = useState([]);

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
