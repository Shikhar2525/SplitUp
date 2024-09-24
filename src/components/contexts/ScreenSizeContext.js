// ScreenSizeContext.js
import React, { createContext, useContext } from "react";
import { useMediaQuery } from "@mui/material";

const ScreenSizeContext = createContext();

export const ScreenSizeProvider = ({ children }) => {
  const isMobile = useMediaQuery("(max-width:600px)"); // Adjust breakpoint as needed

  return (
    <ScreenSizeContext.Provider value={isMobile}>
      {children}
    </ScreenSizeContext.Provider>
  );
};

export const useScreenSize = () => {
  return useContext(ScreenSizeContext);
};
