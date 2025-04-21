import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useCurrentGroup } from "./CurrentGroup";
import { useCurrentUser } from "./CurrentUser";
import GroupService from "../services/group.service";
import { sortByDate } from "../utils";
import { useLinearProgress } from "./LinearProgress";

const AllGroupsContext = createContext();

export const AllGroupsProvider = ({ children }) => {
  const { setCurrentGroupID } = useCurrentGroup();
  const { currentUser } = useCurrentUser();
  const [allGroups, setAllGroups] = useState([]);
  const { setLinearProgress } = useLinearProgress();
  const [refresh, setRefresh] = useState(false);

  // Real-time Firestore group subscription
  useEffect(() => {
    if (!currentUser?.email) return;
    setLinearProgress(true);
    const unsubscribe = GroupService.subscribeToGroupsByAdminEmail(currentUser.email, (groups) => {
      const sortedGroups = sortByDate(groups);
      setAllGroups(sortedGroups);
      if (sortedGroups?.length > 0) {
        setCurrentGroupID(sortedGroups[0]?.id);
      }
      setLinearProgress(false);
    });
    return () => unsubscribe();
  }, [currentUser?.email, setCurrentGroupID, setLinearProgress]);

  // Optionally keep refreshAllGroups for legacy/manual refresh, but it's not needed for real-time
  const refreshAllGroups = () => {};


  return (
    <AllGroupsContext.Provider
      value={{ allGroups, setAllGroups, refreshAllGroups }}
    >
      {children}
    </AllGroupsContext.Provider>
  );
};

export const useAllGroups = () => {
  return useContext(AllGroupsContext);
};
