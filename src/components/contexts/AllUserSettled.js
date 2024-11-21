import React, { createContext, useContext, useState } from "react";

const AllUserSettledContext = createContext();

export const AllUserSettledProvider = ({ children }) => {
  const [allUserSettled, setAllUserSettled] = useState(false);
  return (
    <AllUserSettledContext.Provider
      value={{ allUserSettled, setAllUserSettled }}
    >
      {children}
    </AllUserSettledContext.Provider>
  );
};

export const useAllUserSettled = () => {
  return useContext(AllUserSettledContext);
};
