import React, { createContext, useContext, useState } from "react";

const LinerProgressContext = createContext();

export const LinerProgressProvider = ({ children }) => {
  const [isLinearProgress, setLinearProgress] = useState(false);
  return (
    <LinerProgressContext.Provider
      value={{ isLinearProgress, setLinearProgress }}
    >
      {children}
    </LinerProgressContext.Provider>
  );
};

export const useLinearProgress = () => {
  return useContext(LinerProgressContext);
};
