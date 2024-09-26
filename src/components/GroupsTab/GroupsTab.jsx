import React, { useState } from "react";
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
import CategoryIcon from "@mui/icons-material/Category"; // Import category icon
import { useScreenSize } from "../contexts/ScreenSizeContext";
import Expenses from "../Expenses/Expenses";
import AddExpenseModal from "../AddExpense/AddExpenseModal";
import AddGroupModal from "../AddGroup/AddGroupModal";
import { useCurrentGroup } from "../contexts/CurrentGroup";

// Custom styled Select component with reduced height
const CustomSelect = styled(Select)(({ theme }) => ({
  "& .MuiSelect-select": {
    padding: "7px 12px", // Reduced padding for the select to decrease height
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
  const handleClose = () => {
    setModelOpen(false);
  };
  const { currentGroup, setCurrentGroup } = useCurrentGroup();
  const groups = [
    {
      name: "Trip to mumbai",
      description: "This is group 1",
      members: ["Alice", "Bob"],
      createdDate: "2024-01-01", // Example date
      category: "Food", // Example category
    },
    {
      name: "Group 2",
      description: "This is group 2",
      members: ["Charlie", "David"],
      createdDate: "2024-01-02", // Example date
      category: "Travel", // Example category
    },
    {
      name: "Group 3",
      description: "This is group 3",
      members: ["Eve", "Frank"],
      createdDate: "2024-01-03", // Example date
      category: "Shopping", // Example category
    },
  ];

  // State for selected group and tab

  const [tabIndex, setTabIndex] = useState(0);

  const handleGroupChange = (event) => {
    setCurrentGroup(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const selectedGroupDetails = groups.find(
    (group) => group.name === currentGroup
  );

  return (
    <Box
      sx={{
        width: "100%",
        boxShadow: 3,
        borderRadius: 2,
        marginTop: isMobile ? 5 : 1,
      }}
    >
      <Box
        sx={{
          p: 1, // Reduced padding for the container holding the select
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
            renderValue={(value) => (
              <Chip
                size="small"
                label={selectedGroupDetails?.name}
                variant="outlined"
                color="primary"
              />
            )}
          >
            {groups.map((group, index) => (
              <MenuItem key={index} value={group.name}>
                <Typography variant="body1">{group.name}</Typography>
              </MenuItem>
            ))}
          </CustomSelect>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setModelOpen(true)}
          sx={{
            backgroundColor: "#8675FF",
            color: "#FFF",
            "&:hover": {
              backgroundColor: "#FD7289",
            },
            borderRadius: "8px",
            padding: isMobile ? 0 : "2px 8px",
            display: "flex", // Using flex to align items
            alignItems: "center", // Centering items vertically
            ...(isMobile && { minWidth: "38px" }),
          }}
        >
          <AddIcon /> {/* Adding the plus icon */}
          {!isMobile && "New Group"}
        </Button>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!isMobile && (
            <Typography
              variant="subtitle1"
              margin={0.5}
              sx={{ color: "#353E6C" }}
            >
              Members:
            </Typography>
          )}
          <AvatarGroup max={4}>
            {selectedGroupDetails.members.map((member, index) => (
              <Avatar
                key={index}
                alt={member}
                src={`https://mui.com/static/images/avatar/${index + 1}.jpg`} // Placeholder, adjust as needed
              />
            ))}
          </AvatarGroup>
        </Box>
      </Box>
      {/* Small Bar for Group Name, Date Created, and Category */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#f0f0f0",
          borderRadius: "0 0 8px 8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Created on:{" "}
          {new Date(selectedGroupDetails.createdDate).toLocaleDateString()}
        </Typography>
      </Box>
      <Divider />
      {/* Tabs Section */}
      <AppBar
        position="static"
        color="transparent"
        sx={{ minHeight: "40px" }} // Reduced height
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          sx={{
            minHeight: "45px", // Reduced tab height
            "& .MuiTab-root": {
              padding: "6px 12px", // Reduced padding for tabs
              minHeight: "45px", // Reduced tab button height
            },
          }}
        >
          <Tab label="Expenses" icon={<PaidIcon />} iconPosition="start" />
          <Tab label="Balances" icon={<BalanceIcon />} iconPosition="start" />
          <Tab label="Totals" icon={<AddCircleIcon />} iconPosition="start" />
        </Tabs>
      </AppBar>
      {/* Tab Panel Section */}
      <Box sx={{ p: 2 }}>
        {tabIndex === 0 && <Expenses />}
        {tabIndex === 1 && (
          <Typography variant="body2" color="text.secondary">
            {selectedGroupDetails.members.join(", ")}
          </Typography>
        )}
        {tabIndex === 2 && (
          <Typography variant="body2" color="text.secondary">
            Settings content goes here.
          </Typography>
        )}
      </Box>
      <AddGroupModal open={modelOpen} handleClose={handleClose} />
    </Box>
  );
};

export default GroupTab;
