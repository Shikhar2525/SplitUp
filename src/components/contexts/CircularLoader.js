import React, { createContext, useContext, useState } from "react";

const CircularLoaderContext = createContext();

export const CircularLoaderProvider = ({ children }) => {
  const [circularLoader, setCircularLoader] = useState(false);

  return (
    <CircularLoaderContext.Provider
      value={{ circularLoader, setCircularLoader }}
    >
      {children}
    </CircularLoaderContext.Provider>
  );
};

export const useCircularLoader = () => {
  return useContext(CircularLoaderContext);
};
