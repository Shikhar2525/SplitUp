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
  Alert,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddExpenseButton from "../AddExpense/AddExpenseModal";
import PaidIcon from "@mui/icons-material/Paid";
import BalanceIcon from "@mui/icons-material/Balance";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import Expenses from "../Expenses/Expenses";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import NoDataScreen from "../NoDataScreen/NoDataScreen";
import { convertCurrency, formatDate } from "../utils";
import { useAllGroups } from "../contexts/AllGroups";
import { Tooltip } from "@mui/material";
import AddMemberModal from "../AddMemberModal/AddMemberModal";
import Groups2Icon from "@mui/icons-material/Groups2";
import { useLinearProgress } from "../contexts/LinearProgress";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsSettings from "../GroupSettings/GroupsSettings";
import { useCurrentUser } from "../contexts/CurrentUser";
import GroupBalances from "../GroupBalances/GroupBalances";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SettleTab from "../SettleTab/SettleTab";
import { useCircularLoader } from "../contexts/CircularLoader";
import userService from "../services/user.service";
import groupService from "../services/group.service";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import ShareLink from "../ShareLink/ShareLink";
import GroupComponent from "../JoinGroup/JoinGroup";
import { useAllUserSettled } from "../contexts/AllUserSettled";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Notes from "../Notes/Notes";
import InfoIcon from "@mui/icons-material/Info";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useNavigate } from "react-router-dom";

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
  const { currentUser } = useCurrentUser();
  const [settledMemberStats, setSettledMemberStats] = useState({});
  const { setCircularLoader } = useCircularLoader();
  const [groupsIDs, setGroupIDs] = useState([]);
  const { setCurrentCurrency } = useCurrentCurrency();
  const { allUserSettled, setAllUserSettled } = useAllUserSettled();

  const title = allGroups?.find((group) => group.id === currentGroupID)?.title;
  const currentGroup = allGroups?.find((group) => group.id === currentGroupID);
  const members = allGroups?.find(
    (group) => group.id === currentGroupID
  )?.members;
  const currentGroupAdminEmail = allGroups?.find(
    (group) => group.id === currentGroupID
  )?.admin?.email;

  const calculateMemberStats = () => {
    if (members) {
      const totalMembers = members.length;
      const settledMembers = members.filter(
        (member) => member?.userSettled
      ).length;
      setSettledMemberStats({ totalMembers, settledMembers });
    }
  };

  convertCurrency(1, "USD", "INR").then((result) => console.log(result));

  const updateMembersIsUserExist = async () => {
    let updated = false;
    try {
      setCircularLoader(true);
      // Create an array of promises to fetch users
      const memberPromises = currentGroup?.members?.map(async (member) => {
        const user = await fetchUser(member?.email);
        console.log(user);
        if (user) {
          updated = true;
          return {
            ...user, // If user exists, return the user object
            userSettled: member?.userSettled,
          };
        } else {
          return member; // If no user found, return the original member
        }
      });

      // Wait for all promises to resolve
      const newMembers = await Promise.all(memberPromises);

      const expensePromises = currentGroup?.expenses?.map(async (expense) => {
        const paidByUser = await fetchUser(expense.paidBy.email);

        const splitPromises = expense.splitBetween.map(async (splitOption) => {
          const user = await fetchUser(splitOption.email); // Fetch user by splitOption email
          return user ? { ...user } : splitOption; // Replace with user if found
        });

        // Wait for all split promises to resolve
        const updatedSplitBetween = await Promise.all(splitPromises);

        // Return updated expense with the new splitBetween
        return {
          ...expense,
          splitBetween: updatedSplitBetween,
          paidBy: paidByUser ? { ...paidByUser } : expense.paidBy,
        };
      });

      const updatedExpenses = await Promise.all(expensePromises);

      // Now update the group with new members
      await groupService.updateMembersInGroup(
        currentGroupID,
        newMembers,
        updatedExpenses
      );
      if (updated) {
        refreshAllGroups();
      }
    } catch (error) {
      console.error(error.message);
    } finally {
      setCircularLoader(false);
    }
  };

  const fetchUser = async (email) => {
    try {
      const user = await userService.getUserByEmail(email);
      return user;
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const isSettled = currentGroup?.members?.every((item) => item.userSettled);
    setAllUserSettled(isSettled);
  }, [currentGroup]);

  useEffect(() => {
    if (currentGroupID && !groupsIDs.includes(currentGroupID)) {
      updateMembersIsUserExist();
      if (!groupsIDs.includes(currentGroupID)) {
        setGroupIDs([...groupsIDs, currentGroupID]);
      }
    }
  }, [currentGroupID]);

  useEffect(() => {
    if (currentGroup)
      setCurrentCurrency(currentGroup?.defaultCurrency || "INR");
  }, [currentGroup, allGroups]);

  const dynamicTabs = useMemo(() => {
    const tabs = [
      { label: "Expenses", icon: <PaidIcon />, component: <Expenses /> },
    ];

    if (currentGroup?.expenses?.length > 0) {
      tabs.push({
        label: "Balances",
        icon: <BalanceIcon />,
        component: <GroupBalances group={currentGroup} />,
      });

      tabs.push({
        label: `Settle (${settledMemberStats?.settledMembers}/${settledMemberStats?.totalMembers})`,
        icon: <HowToRegIcon />,
        component: <SettleTab members={members} groupID={currentGroupID} />,
      });
    }

    // Add Notes tab before Settings
    tabs.push({
      label: "Notes",
      icon: <StickyNote2Icon />,
      component: <Notes groupId={currentGroupID} />,
    });

    // Add Settings tab last if user is admin
    if (currentGroupAdminEmail === currentUser?.email) {
      tabs.push({
        label: "Settings",
        icon: <SettingsIcon />,
        component: (
          <GroupsSettings
            groupID={currentGroupID}
            groupName={currentGroup?.title}
            defaultCurrency={currentGroup?.defaultCurrency}
          />
        ),
      });
    }

    return tabs;
  }, [settledMemberStats, currentGroup, currentGroupAdminEmail, currentUser?.email]);

  useEffect(() => {
    setLinearProgress(true);
    const storedGroup = JSON.parse(localStorage.getItem("currentGroupID"));

    if (storedGroup) {
      // Check if the stored group ID exists in the current groups
      const isGroupValid = allGroups.some((group) => group.id === storedGroup);

      if (isGroupValid) {
        setCurrentGroupID(storedGroup);
      } else if (allGroups.length > 0) {
        // If the stored group is not valid, set to the first group
        setCurrentGroupID(allGroups[0].id);
      } else {
        // If no groups exist, clear the current group ID
        setCurrentGroupID(null);
      }
    } else if (allGroups.length > 0) {
      setCurrentGroupID(allGroups[0].id);
    }

    setLinearProgress(false);
  }, [allGroups, setCurrentGroupID]);

  useEffect(() => {
    calculateMemberStats();
  }, [currentGroupID, currentGroup]);

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

  const handleClose = () => {
    setModelOpen(false);
  };

  const toggleMembersModal = useCallback(
    () => setMemberModal((prev) => !prev),
    []
  );

  const GroupInfoBar = React.memo(({ selectedGroupDetails }) => {
    const totalExpenses = selectedGroupDetails?.expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
    const memberCount = selectedGroupDetails?.members?.length || 1;
    const perHeadCost = (totalExpenses / memberCount).toFixed(2);

    return (
      <Box sx={{
        p: { xs: 1.5, sm: 2 },
        backgroundColor: "rgba(94, 114, 228, 0.03)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: "space-between",
        gap: { xs: 1.5, sm: 2 },
        border: '1px solid rgba(94, 114, 228, 0.1)',
      }}>
        {/* Left Section - Group Info */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          flex: { xs: '1', sm: '2' },
          minWidth: 0 // Enable text truncation
        }}>
          <Box sx={{
            backgroundColor: 'rgba(94, 114, 228, 0.1)',
            borderRadius: '12px',
            width: { xs: 40, sm: 45, md: 50 },
            height: { xs: 40, sm: 45, md: 50 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <InfoIcon sx={{ color: '#5e72e4', fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' } }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={selectedGroupDetails?.description || selectedGroupDetails?.title} arrow>
              <Typography
                variant="h6"
                sx={{
                  color: "#525f7f",
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  fontWeight: 600,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {selectedGroupDetails?.description || selectedGroupDetails?.title}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        {/* Center Section - Stats */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          justifyContent: { xs: 'space-between', sm: 'center' },
          flex: { xs: '1', sm: '2' },
          borderLeft: { xs: 'none', sm: '1px solid rgba(136, 152, 170, 0.2)' },
          paddingLeft: { xs: 0, sm: 3 }
        }}>
          {/* Total Amount */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 0.5,
            minWidth: 0
          }}>
            <Typography variant="caption" sx={{ 
              color: '#8898aa', 
              fontWeight: 500,
              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
            }}>
              Total Amount
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ 
                color: '#5e72e4', 
                fontSize: { xs: '1rem', sm: '1.1rem' } 
              }} />
              <Typography sx={{ 
                color: '#5e72e4', 
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
              }}>
                {totalExpenses} {selectedGroupDetails?.defaultCurrency}
              </Typography>
            </Box>
          </Box>

          {/* Per Head Cost */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 0.5,
            borderLeft: { xs: 'none', sm: '1px solid rgba(136, 152, 170, 0.2)' },
            paddingLeft: { xs: 0, sm: 3 },
            minWidth: 0
          }}>
            <Typography variant="caption" sx={{ 
              color: '#8898aa', 
              fontWeight: 500,
              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
            }}>
              Appx Per Person
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceWalletIcon sx={{ 
                color: '#2dce89', 
                fontSize: { xs: '1rem', sm: '1.1rem' } 
              }} />
              <Typography sx={{ 
                color: '#2dce89', 
                fontWeight: 600,
                fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
              }}>
                {perHeadCost} {selectedGroupDetails?.defaultCurrency}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Section - Date and Share */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 2, sm: 3 },
          justifyContent: { xs: 'space-between', sm: 'flex-end' },
          flex: { xs: '1', sm: '1.5' },
          borderLeft: { xs: 'none', sm: '1px solid rgba(136, 152, 170, 0.2)' },
          paddingLeft: { xs: 0, sm: 3 }
        }}>
          {/* Created Date */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1,
            minWidth: 0
          }}>
            <CalendarTodayIcon sx={{ 
              fontSize: { xs: '1rem', sm: '1.1rem' }, 
              color: '#8898aa' 
            }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <Typography variant="caption" sx={{ 
                color: '#8898aa', 
                fontWeight: 600, 
                fontSize: { xs: '0.65rem', sm: '0.7rem' }
              }}>
                Created
              </Typography>
              <Tooltip title={formatDate(selectedGroupDetails?.createdDate) ?? "N/A"} arrow>
                <Typography sx={{ 
                  color: '#525f7f', 
                  fontWeight: 600, 
                  fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: { xs: '100px', sm: '120px', md: '150px' }
                }}>
                  {formatDate(selectedGroupDetails?.createdDate) ?? "N/A"}
                </Typography>
              </Tooltip>
            </Box>
          </Box>

          <ShareLink />
        </Box>
      </Box>
    );
  });

  return (
    <Box
      sx={{
        width: "100%",
        boxShadow: 3,
        borderRadius: 2,
        mt: isMobile ? 5 : 1,
        height: "81vh",
      }}
    >
      {allUserSettled && (
        <Box
          sx={{
            mx: { xs: 1.5, sm: 2 },
            my: { xs: 1, sm: 1.5 },
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: 45, sm: 50 },
            borderRadius: '12px',
            background: 'linear-gradient(120deg, #4CAF50 0%, #45B649 100%)',
            overflow: 'hidden',
            animation: 'slideDown 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            '@keyframes slideDown': {
              from: { transform: 'translateY(-100%)', opacity: 0 },
              to: { transform: 'translateY(0)', opacity: 1 }
            }
          }}
        >
          {/* Success Icon */}
          <Box
            sx={{
              position: 'absolute',
              left: { xs: '15px', sm: '20px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: '32px', sm: '36px' },
              height: { xs: '32px', sm: '36px' },
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)' },
                '70%': { transform: 'scale(1.1)', boxShadow: '0 0 0 10px rgba(255, 255, 255, 0)' },
                '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)' }
              }
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: '1.2rem', sm: '1.3rem' },
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              ✓
            </Typography>
          </Box>

          {/* Message */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'flex-start', sm: 'center' },
            ml: { xs: '55px', sm: 0 },
            color: 'white'
          }}>
            <Typography
              sx={{
                fontSize: { xs: '0.8rem', sm: '0.9rem' },
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              Group settled successfully!
            </Typography>
          </Box>

          {/* Confetti Effect */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.2,
              backgroundImage: `
                radial-gradient(circle at 20% -50%, white 6px, transparent 8px),
                radial-gradient(circle at 75% 150%, white 6px, transparent 8px),
                radial-gradient(circle at 100% 50%, white 4px, transparent 6px),
                radial-gradient(circle at 50% -20%, white 4px, transparent 6px),
                radial-gradient(circle at 0% 80%, white 3px, transparent 4px)
              `,
              backgroundSize: '80px 80px',
              animation: 'confetti 3s linear infinite',
              '@keyframes confetti': {
                '0%': { backgroundPosition: '0 0' },
                '100%': { backgroundPosition: '80px 80px' }
              }
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {allGroups?.length > 0 ? (
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
              {allGroups?.map((group, index) => (
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
          size="small"
          variant="contained"
          onClick={() => setModelOpen(true)}
          sx={{
            fontSize: 12,
            backgroundColor: "#8675FF",
            borderRadius: "20px",
            color: "#FFF",
            "&:hover": { backgroundColor: "#FD7289" },
          }}
        >
          Add {!isMobile && "Expense"}
        </Button>
        {allGroups?.length > 0 && (
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

      {allGroups?.length > 0 ? (
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
              {" "}
              {dynamicTabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          </AppBar>
          <Box sx={{ p: 2 }}>{dynamicTabs[tabIndex]?.component}</Box>
        </>
      ) : (
        <NoDataScreen message="No groups, create new" />
      )}

      <AddMemberModal
        open={memberModal}
        handleClose={toggleMembersModal}
        existingMembers={
          allGroups.find((member) => member.id === currentGroupID)?.members
        }
      />

      <AddExpenseButton open={modelOpen} handleClose={handleClose} />

      <GroupComponent></GroupComponent>
    </Box>
  );
};

// Memoized AvatarGroup section to prevent re-rendering
const AvatarGroupSection = React.memo(({ members }) => {
  // Get the names of members for tooltip display
  const memberNames = members?.map((member) => ({
    name: member?.name,
    picture: member?.profilePicture,
  }));

  // Create tooltip content with new lines and avatars
  const tooltipContent = (
    <div>
      {memberNames?.map((member, index) => (
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
        {members?.length > 0 ? "Members :" : "No members"}
      </Typography>
      <Tooltip title={tooltipContent} arrow>
        <AvatarGroup max={4}>
          {members?.slice(0, 4)?.map((member, index) => (
            <Avatar
              key={index}
              alt={member?.email ?? "Anonymous"}
              src={member?.profilePicture}
            >
              {member?.name
                ? member?.name?.charAt(0)
                : member?.email?.charAt(0)}
            </Avatar>
          ))}
        </AvatarGroup>
      </Tooltip>
    </Box>
  );
});

export default GroupTab;
