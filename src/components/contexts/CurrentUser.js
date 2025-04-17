import React, { createContext, useContext, useState, useEffect } from "react";
import userService from "../services/user.service"; // Import userService for Firestore subscription

const CurrentUserContext = createContext();

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));

  // Listen for userEmail changes in localStorage
  useEffect(() => {
    const checkEmail = () => {
      const email = localStorage.getItem("userEmail");
      if (email !== userEmail) setUserEmail(email);
    };
    window.addEventListener("storage", checkEmail);
    const interval = setInterval(checkEmail, 500); // fallback for same-tab changes
    return () => {
      window.removeEventListener("storage", checkEmail);
      clearInterval(interval);
    };
  }, [userEmail]);

  useEffect(() => {
    if (!userEmail) {
      console.warn("CurrentUserProvider: No userEmail found in localStorage!");
      return;
    }
    console.log("CurrentUserProvider: Setting up Firestore subscription for:", userEmail);
    const unsubscribe = userService.subscribeToUserByEmail(userEmail, (user) => {
      console.log("CurrentUser subscription fired:", user);
      setCurrentUser(user);
    });
    return () => {
      console.log("CurrentUserProvider: Unsubscribing from Firestore for:", userEmail);
      unsubscribe && unsubscribe();
    };
  }, [userEmail]);

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  return useContext(CurrentUserContext);
};
