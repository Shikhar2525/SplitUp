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
  IconButton,
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
import NoDataScreen from "../NoDataScreen/NoDataScreen";
import { formatDate } from "../utils";
import { useAllGroups } from "../contexts/AllGroups";
import { Tooltip } from "@mui/material"; // Import Tooltip from MUI
import AddMemberModal from "../AddMemberModal/AddMemberModal";
import Groups2Icon from "@mui/icons-material/Groups2";
import { useLinearProgress } from "../contexts/LinearProgress";

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
  const [memberModal, setMemberModal] = useState(false);
  const { currentGroupID, setCurrentGroupID } = useCurrentGroup();
  const { allGroups, refreshAllGroups } = useAllGroups();
  const [tabIndex, setTabIndex] = useState(0);
  const { setLinearProgress } = useLinearProgress();

  const title = allGroups?.find((group) => group.id === currentGroupID)?.title;

  // Set currentGroup from localStorage or default to the first group
  useEffect(() => {
    setLinearProgress(true);
    const storedGroup = JSON.parse(localStorage.getItem("currentGroupID"));
    if (storedGroup) {
      setCurrentGroupID(storedGroup);
    } else if (allGroups.length > 0) {
      setCurrentGroupID(allGroups[0].id);
    }
    setLinearProgress(false);
  }, [allGroups, setCurrentGroupID]);

  // Memoized group details
  const selectedGroupDetails = useMemo(
    () => allGroups.find((group) => group.title === title),
    [allGroups, currentGroupID]
  );

  const handleGroupChange = useCallback(
    (event) => {
      const selectedValue = event.target.value;
      setCurrentGroupID(selectedValue);
      localStorage.setItem("currentGroupID", JSON.stringify(selectedValue)); // Store in localStorage
    },
    [setCurrentGroupID]
  );

  const handleTabChange = useCallback(
    (_, newValue) => setTabIndex(newValue),
    []
  );

  const toggleModal = useCallback(() => setModelOpen((prev) => !prev), []);
  const toggleMembersModal = useCallback(
    () => setMemberModal((prev) => !prev),
    []
  );

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
              value={currentGroupID || ""}
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
                <MenuItem key={index} value={group.id}>
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            {!isMobile && (
              <AvatarGroupSection members={selectedGroupDetails?.members} />
            )}
            <IconButton onClick={toggleMembersModal} sx={{ color: "#1657FF" }}>
              <Groups2Icon />
            </IconButton>
          </Box>
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
        refreshGroups={() => refreshAllGroups()}
      />

      <AddMemberModal
        open={memberModal}
        handleClose={toggleMembersModal}
        refreshGroupMembers={undefined}
      />
    </Box>
  );
};

// Memoized AvatarGroup section to prevent re-rendering
const AvatarGroupSection = React.memo(({ members }) => {
  // Get the names of members for tooltip display
  const memberNames = members.map((member) => ({
    name: member?.firstName
      ? `${member.firstName} ${member.lastName}`
      : member?.email ?? "Anonymous",
    picture: member?.profilePicture,
  }));

  // Create tooltip content with new lines and avatars
  const tooltipContent = (
    <div>
      {memberNames.map((member, index) => (
        <Box
          key={index}
          sx={{ display: "flex", alignItems: "center", marginBottom: 1 }}
        >
          <Avatar
            alt={member.name}
            src={member.picture}
            sx={{ width: 24, height: 24, marginRight: 1 }} // Small avatar
          />
          <Typography variant="body2" sx={{ margin: 0 }}>
            {member.name}
          </Typography>
        </Box>
      ))}
    </div>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Typography variant="subtitle1" margin={0.5} sx={{ color: "#353E6C" }}>
        {members.length > 0 ? "Members :" : "No members"}
      </Typography>
      <Tooltip title={tooltipContent} arrow>
        <AvatarGroup max={4}>
          {members.slice(0, 4).map((member, index) => (
            <Avatar
              key={index}
              alt={member?.email ?? "Anonymous"}
              src={member?.profilePicture}
            />
          ))}
        </AvatarGroup>
      </Tooltip>
    </Box>
  );
});

// Memoized group info bar
const GroupInfoBar = React.memo(({ selectedGroupDetails }) => {
  const descriptionOrTitle = selectedGroupDetails?.description
    ? `Description: ${selectedGroupDetails?.description}`
    : `Group: ${selectedGroupDetails?.title}`;

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center", // Align items horizontally in the center
        justifyContent: "space-between",
        gap: 2, // Space between elements
      }}
    >
      <Tooltip title={descriptionOrTitle} arrow>
        <Typography
          variant="subtitle2"
          color="textSecondary"
          sx={{
            overflow: "hidden", // Hide overflowing text
            textOverflow: "ellipsis", // Add ellipsis when text is truncated
            whiteSpace: "nowrap", // Prevent text wrapping
            maxWidth: "60%", // Set a specific width to limit the text (adjust as needed)
            cursor: "pointer", // Show pointer on hover
          }}
        >
          {descriptionOrTitle}
        </Typography>
      </Tooltip>

      <Typography variant="subtitle2" color="textSecondary">
        Created on: {formatDate(selectedGroupDetails?.createdDate) ?? "N/A"}
      </Typography>
    </Box>
  );
});

export default GroupTab;
