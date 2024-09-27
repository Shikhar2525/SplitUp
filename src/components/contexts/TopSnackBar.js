import React, { createContext, useContext, useState } from "react";

const TopSnackBarContext = createContext();

export const TopSnackBarProvider = ({ children }) => {
  const [snackBar, setSnackBar] = useState({
    isOpen: false,
    message: "",
    handleClose: () => setSnackBar((prev) => ({ ...prev, isOpen: false })),
  });

  return (
    <TopSnackBarContext.Provider value={{ snackBar, setSnackBar }}>
      {children}
    </TopSnackBarContext.Provider>
  );
};

export const useTopSnackBar = () => {
  return useContext(TopSnackBarContext);
};
