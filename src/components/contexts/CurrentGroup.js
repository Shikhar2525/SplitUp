import React, { createContext, useContext, useState } from "react";

const CurrentGroupContext = createContext();

export const CurrentGroupProvider = ({ children }) => {
  const [currentGroupID, setCurrentGroupID] = useState();
  return (
    <CurrentGroupContext.Provider value={{ currentGroupID, setCurrentGroupID }}>
      {children}
    </CurrentGroupContext.Provider>
  );
};

export const useCurrentGroup = () => {
  return useContext(CurrentGroupContext);
};
