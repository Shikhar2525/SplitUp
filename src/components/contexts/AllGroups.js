import React, { createContext, useContext, useState } from "react";

const AllGroupsContext = createContext();

export const AllGroupsProvider = ({ children }) => {
  const [allGroups, setAllGroups] = useState([]);
  return (
    <AllGroupsContext.Provider value={{ allGroups, setAllGroups }}>
      {children}
    </AllGroupsContext.Provider>
  );
};

export const useAllGroups = () => {
  return useContext(AllGroupsContext);
};
