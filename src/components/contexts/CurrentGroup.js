import React, { createContext, useContext, useState } from "react";

const CurrentGroupContext = createContext();

export const CurrentGroupProvider = ({ children }) => {
  const [currentGroup, setCurrentGroup] = useState("Trip to mumbai");
  return (
    <CurrentGroupContext.Provider value={{ currentGroup, setCurrentGroup }}>
      {children}
    </CurrentGroupContext.Provider>
  );
};

export const useCurrentGroup = () => {
  return useContext(CurrentGroupContext);
};
