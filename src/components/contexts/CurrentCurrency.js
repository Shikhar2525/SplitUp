import React, { createContext, useContext, useState } from "react";

const CurrentCurrencyContext = createContext();

export const CurrentCurrencyrProvider = ({ children }) => {
  const [currentCurrency, setCurrentCurrency] = useState("INR");

  return (
    <CurrentCurrencyContext.Provider
      value={{ currentCurrency, setCurrentCurrency }}
    >
      {children}
    </CurrentCurrencyContext.Provider>
  );
};

export const useCurrentCurrency = () => {
  return useContext(CurrentCurrencyContext);
};
