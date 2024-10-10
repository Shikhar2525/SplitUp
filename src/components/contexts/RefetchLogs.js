import React, { createContext, useContext, useState } from "react";

const RefetchLogsContext = createContext();

export const RefetchLogsProvider = ({ children }) => {
  const [refetchLogs, setRefetchLogs] = useState(false);

  return (
    <RefetchLogsContext.Provider value={{ refetchLogs, setRefetchLogs }}>
      {children}
    </RefetchLogsContext.Provider>
  );
};

export const useRefetchLogs = () => {
  return useContext(RefetchLogsContext);
};
