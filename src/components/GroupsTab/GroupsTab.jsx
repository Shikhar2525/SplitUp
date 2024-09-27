import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  AppBar,
  Box,
  MenuItem,
  FormControl,
  Select,
  Typography,
  Divider,
  styled,
  Chip,
  AvatarGroup,
  Avatar,
  Tabs,
  Tab,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PaidIcon from "@mui/icons-material/Paid";
import BalanceIcon from "@mui/icons-material/Balance";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import Expenses from "../Expenses/Expenses";
import AddGroupModal from "../AddGroup/AddGroupModal";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import GroupService from "../services/group.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useLinearProgress } from "../contexts/LinearProgress";
import NoDataScreen from "../NoDataScreen/NoDataScreen";
import { formatDate, sortByDate } from "../utils";
import { useAllGroups } from "../contexts/AllGroups";

// Custom styled Select component
const CustomSelect = styled(Select)(({ theme }) => ({
  "& .MuiSelect-select": {
    padding: "7px 12px",
    borderRadius: "8px",
    backgroundColor: theme.palette.background.paper,
    transition: "background-color 0.3s ease",
  },
  "& .MuiSelect-icon": {
    right: 12,
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    "& fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
    "&:hover fieldset": {
      borderColor: theme.palette.secondary.main,
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.secondary.main,
    },
  },
  "&:hover": {
    "& .MuiSelect-select": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const GroupTab = () => {
  const isMobile = useScreenSize();
  const [modelOpen, setModelOpen] = useState(false);
  const { currentGroup, setCurrentGroup } = useCurrentGroup();
  const { currentUser } = useCurrentUser();
  const { allGroups, setAllGroups } = useAllGroups();
  const { setLinearProgress } = useLinearProgress();
  const [refresh, setRefresh] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Memoized fetch function to reduce unnecessary re-renders
  const fetchGroups = useCallback(async () => {
    setLinearProgress(true);
    try {
      const fetchedGroups = await GroupService.fetchGroupsByAdminEmail(
        currentUser?.email ?? ""
      );
      // Sort the fetched groups by date
      const sortedGroups = sortByDate(fetchedGroups);
      setAllGroups(sortedGroups);

      // Set the first group in the sorted list as the default
      if (sortedGroups.length > 0) {
        setCurrentGroup(sortedGroups[0]?.title);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLinearProgress(false);
    }
  }, [currentUser?.email, setCurrentGroup, setLinearProgress]);

  // Fetch groups on mount or refresh
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups, refresh]);

  // Memoized group details
  const selectedGroupDetails = useMemo(
    () => allGroups.find((group) => group.title === currentGroup),
    [allGroups, currentGroup]
  );

  const handleGroupChange = useCallback(
    (event) => setCurrentGroup(event.target.value),
    [setCurrentGroup]
  );

  const handleTabChange = useCallback(
    (_, newValue) => setTabIndex(newValue),
    []
  );

  const toggleModal = useCallback(() => setModelOpen((prev) => !prev), []);

  return (
    <Box
      sx={{
        width: "100%",
        boxShadow: 3,
        borderRadius: 2,
        mt: isMobile ? 5 : 1,
      }}
    >
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {allGroups.length > 0 ? (
          <FormControl
            fullWidth
            variant="outlined"
            sx={{ width: isMobile ? "50%" : "20%" }}
          >
            <CustomSelect
              value={currentGroup}
              onChange={handleGroupChange}
              IconComponent={KeyboardArrowDownIcon}
              displayEmpty
              renderValue={() => (
                <Chip
                  size="small"
                  label={selectedGroupDetails?.title ?? "Select Group"}
                  variant="outlined"
                  color="primary"
                />
              )}
            >
              {allGroups.map((group, index) => (
                <MenuItem key={index} value={group.title}>
                  <Typography variant="body1">{group.title}</Typography>
                </MenuItem>
              ))}
            </CustomSelect>
          </FormControl>
        ) : (
          <Typography
            variant="subtitle2"
            color="textSecondary"
            sx={{ marginLeft: 1 }}
          >
            No active Group
          </Typography>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={toggleModal}
          sx={{
            backgroundColor: "#8675FF",
            color: "#FFF",
            "&:hover": { backgroundColor: "#FD7289" },
            borderRadius: "8px",
            p: isMobile ? 0 : "2px 8px",
            display: "flex",
            alignItems: "center",
            ...(isMobile && { minWidth: "38px" }),
          }}
        >
          <AddIcon />
          {!isMobile && "New Group"}
        </Button>
        {allGroups.length > 0 && (
          <AvatarGroupSection members={selectedGroupDetails?.members} />
        )}
      </Box>

      {allGroups.length > 0 ? (
        <>
          <GroupInfoBar selectedGroupDetails={selectedGroupDetails} />
          <Divider />
          <AppBar
            position="static"
            color="transparent"
            sx={{ minHeight: "40px" }}
          >
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="scrollable"
              sx={{
                minHeight: "45px",
                "& .MuiTab-root": { padding: "6px 12px", minHeight: "45px" },
              }}
            >
              <Tab label="Expenses" icon={<PaidIcon />} iconPosition="start" />
              <Tab
                label="Balances"
                icon={<BalanceIcon />}
                iconPosition="start"
              />
              <Tab
                label="Totals"
                icon={<AddCircleIcon />}
                iconPosition="start"
              />
            </Tabs>
          </AppBar>
          <Box sx={{ p: 2 }}>
            {tabIndex === 0 && <Expenses />}
            {tabIndex === 1 && (
              <Typography variant="body2" color="text.secondary">
                {selectedGroupDetails?.members
                  ?.map((member) => member.email)
                  .join(", ") ?? "No members available"}
              </Typography>
            )}
            {tabIndex === 2 && (
              <Typography variant="body2" color="text.secondary">
                Settings content goes here.
              </Typography>
            )}
          </Box>
        </>
      ) : (
        <NoDataScreen message="No groups" />
      )}

      <AddGroupModal
        open={modelOpen}
        handleClose={toggleModal}
        refreshGroups={() => setRefresh(!refresh)}
      />
    </Box>
  );
};

// Memoized AvatarGroup section to prevent re-rendering
const AvatarGroupSection = React.memo(({ members }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <Typography variant="subtitle1" margin={0.5} sx={{ color: "#353E6C" }}>
      Members:
    </Typography>
    <AvatarGroup max={4}>
      {members?.map((member, index) => (
        <Avatar
          key={index}
          alt={member?.email ?? "Anonymous"}
          src={`https://mui.com/static/images/avatar/${index + 1}.jpg`}
        />
      )) ?? <Typography variant="body2">No members available</Typography>}
    </AvatarGroup>
  </Box>
));

// Memoized group info bar
const GroupInfoBar = React.memo(({ selectedGroupDetails }) => (
  <Box
    sx={{
      p: 2,
      backgroundColor: "#f0f0f0",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography variant="h6">
      {selectedGroupDetails?.title ?? "Group Title"}
    </Typography>
    <Typography variant="subtitle2" color="textSecondary">
      Created on: {formatDate(selectedGroupDetails?.createdDate) ?? "N/A"}
    </Typography>
  </Box>
));

export default GroupTab;
