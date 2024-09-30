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
  const { setCurrentGroup } = useCurrentGroup();
  const { currentUser } = useCurrentUser();
  const [allGroups, setAllGroups] = useState([]);
  const { setLinearProgress } = useLinearProgress();
  const [refresh, setRefresh] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLinearProgress(true);
    try {
      const fetchedGroups = await GroupService.fetchGroupsByAdminEmail(
        currentUser?.email ?? ""
      );
      const sortedGroups = sortByDate(fetchedGroups);
      setAllGroups(sortedGroups);

      if (sortedGroups.length > 0) {
        setCurrentGroup({
          title: sortedGroups[0]?.title,
          id: sortedGroups[0]?.id,
        });
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLinearProgress(false);
    }
  }, [currentUser?.email, setCurrentGroup, setLinearProgress]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, refresh]);

  const refreshAllGroups = () => {
    setRefresh((prev) => !prev);
  };

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
