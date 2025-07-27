import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  AppBar,
  Box,
  MenuItem,
  FormControl,
  Select,
  Typography,
  Divider,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Button,
  IconButton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
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
// import { useAllGroups } from "../contexts/AllGroups"; // Disabled for real-time
import groupService from "../services/group.service";
import AddMemberModal from "../AddMemberModal/AddMemberModal";
import Groups2Icon from "@mui/icons-material/Groups2";
import { useLinearProgress } from "../contexts/LinearProgress";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsSettings from "../GroupSettings/GroupsSettings";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useAllGroups } from "../contexts/AllGroups";
import GroupBalances from "../GroupBalances/GroupBalances";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import SettleTab from "../SettleTab/SettleTab";
import { useCircularLoader } from "../contexts/CircularLoader";
import userService from "../services/user.service";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import ShareLink from "../ShareLink/ShareLink";
import GroupComponent from "../JoinGroup/JoinGroup";
import { useAllUserSettled } from "../contexts/AllUserSettled";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Notes from "../Notes/Notes";
import InfoIcon from "@mui/icons-material/Info";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import HomeIcon from "@mui/icons-material/Home";
import FlightIcon from "@mui/icons-material/Flight";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import presenceService from "../services/presence.service";
import Tooltip from "@mui/material/Tooltip";
import AvatarGroup from "@mui/material/AvatarGroup";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

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

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const GroupTab = () => {
  const isMobile = useScreenSize();
  const [modelOpen, setModelOpen] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const { currentGroupID, setCurrentGroupID } = useCurrentGroup();
  const [allGroups, setAllGroups] = useState([]);
  const { currentUser } = useCurrentUser();
  const { allGroups: contextGroups, refreshAllGroups } = useAllGroups();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve group ID and name from the URL
  const joinGroupId = new URLSearchParams(location.search).get("joinGroupId");

  // Redirect to home if user has no groups
  useEffect(() => {
    if (!joinGroupId && contextGroups && contextGroups.length === 0) {
      navigate("/");
    }
  }, [contextGroups, navigate]);

  // --- Real-time Firestore group subscription ---
  useEffect(() => {
    if (!currentUser?.email) return;
    const unsubscribe = groupService.subscribeToGroupsByAdminEmail(
      currentUser.email,
      (groups) => {
        setAllGroups(groups);
      }
    );
    return () => unsubscribe();
  }, [currentUser?.email]);
  // --- END real-time Firestore group subscription ---

  const [tabIndex, setTabIndex] = useState(0);
  const { setLinearProgress } = useLinearProgress();

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
  }, [
    settledMemberStats,
    currentGroup,
    currentGroupAdminEmail,
    currentUser?.email,
  ]);

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
    const [convertedTotal, setConvertedTotal] = useState(0);
    const [myTotalShare, setMyTotalShare] = useState(0);
    const { currentCurrency } = useCurrentCurrency();
    const { currentUser } = useCurrentUser();
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
      const calculateTotalAmount = async () => {
        let totalInCurrentCurrency = 0;
        let myTotalExpenses = 0;

        if (selectedGroupDetails?.expenses) {
          for (const expense of selectedGroupDetails.expenses) {
            try {
              const { amount: convertedAmount } = await convertCurrency(
                expense.amount,
                expense.currency || selectedGroupDetails.defaultCurrency,
                currentCurrency
              );

              totalInCurrentCurrency += parseFloat(convertedAmount);

              // Calculate my total expenses (both paid by me and my share in others' expenses)
              if (expense.paidBy.email === currentUser?.email) {
                // If I paid, add the amount I won't get back (my share)
                const splitCount = expense.excludePayer
                  ? expense.splitBetween.length
                  : expense.splitBetween.length + 1;
                const myShare = parseFloat(convertedAmount) / splitCount;
                myTotalExpenses += myShare;
              }

              // Add my share if I'm in splitBetween
              if (
                expense.splitBetween.some(
                  (member) => member.email === currentUser?.email
                )
              ) {
                const splitCount = expense.excludePayer
                  ? expense.splitBetween.length
                  : expense.splitBetween.length + 1;
                const myShare = parseFloat(convertedAmount) / splitCount;
                myTotalExpenses += myShare;
              }
            } catch (error) {
              console.error("Currency conversion error:", error);
            }
          }
        }

        setConvertedTotal(totalInCurrentCurrency);
        setMyTotalShare(myTotalExpenses);
      };

      calculateTotalAmount();
    }, [selectedGroupDetails, currentCurrency, currentUser]);

    return (
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          backgroundColor: "rgba(94, 114, 228, 0.03)",
          borderRadius: "12px",
          border: "1px solid rgba(94, 114, 228, 0.1)",
        }}
      >
        {/* Title and Share Section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                backgroundColor: "rgba(94, 114, 228, 0.1)",
                borderRadius: "12px",
                width: { xs: 40, sm: 45, md: 50 },
                height: { xs: 40, sm: 45, md: 50 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <InfoIcon
                sx={{
                  color: "#5e72e4",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "#32325d",
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    fontWeight: 600,
                    mb: 0.5, // Added margin bottom
                  }}
                >
                  {selectedGroupDetails?.title}
                </Typography>
                {/* Active Users Display */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    background: "rgba(94, 114, 228, 0.05)",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    border: "1px solid rgba(94, 114, 228, 0.1)",
                  }}
                >
                  {activeUsers.length > 0 ? (
                    <>
                      <AvatarGroup
                        max={3}
                        sx={{
                          "& .MuiAvatar-root": {
                            width: 24,
                            height: 24,
                            fontSize: "0.8rem",
                            border: "2px solid #fff",
                          },
                        }}
                      >
                        {activeUsers.map((user) => (
                          <Tooltip key={user.id} title={`${user.name} (Active)`} arrow>
                            <StyledBadge
                              overlap="circular"
                              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                              variant="dot"
                            >
                              <Avatar
                                alt={user.name}
                                src={user.profilePicture}
                                sx={{ width: 24, height: 24 }}
                              >
                                {user.name?.[0]}
                              </Avatar>
                            </StyledBadge>
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                      <Typography variant="caption" sx={{ color: "#5e72e4", fontWeight: 600, fontSize: "0.75rem" }}>
                        {activeUsers.length} active
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="caption" sx={{ color: "#8898aa", fontWeight: 500, fontSize: "0.75rem" }}>
                      No active users
                    </Typography>
                  )}
                </Box>
              </Box>
              {selectedGroupDetails?.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#525f7f",
                    fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    opacity: 0.85,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.4,
                    width: "100%",
                  }}
                >
                  {selectedGroupDetails?.description}
                </Typography>
              )}
            </Box>
            <ShareLink />
          </Box>
        </Box>

        <Accordion
          expanded={expanded}
          onChange={() => setExpanded(!expanded)}
          sx={{
            backgroundColor: "transparent",
            boxShadow: "none",
            "&:before": { display: "none" },
            "& .MuiAccordionSummary-root": {
              minHeight: 0,
              padding: 1,
              marginTop: 0,
            },
            "& .MuiAccordionSummary-content": {
              margin: 0,
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "#5e72e4" }} />}
            sx={{
              backgroundColor: "rgba(94, 114, 228, 0.05)",
              borderRadius: "8px",
              padding: "8px 16px",
              "&:hover": {
                backgroundColor: "rgba(94, 114, 228, 0.08)",
              },
              "& .MuiAccordionSummary-content": {
                margin: "0",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <Typography
              sx={{ color: "#5e72e4", fontSize: "0.8rem", fontWeight: 600 }}
            >
              View Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: "16px 0 0" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <StatItem
                icon={<AccountBalanceWalletIcon sx={{ color: "#5e72e4" }} />}
                label="Total Amount"
                value={`${convertedTotal.toFixed(2)} ${currentCurrency}`}
                color="#5e72e4"
              />

              <StatItem
                icon={<AccountBalanceWalletIcon sx={{ color: "#2dce89" }} />}
                label="My Total Expenses "
                value={`${myTotalShare.toFixed(2)} ${currentCurrency}`}
                color="#2dce89"
              />

              <StatItem
                icon={<CalendarTodayIcon sx={{ color: "#8898aa" }} />}
                label="Created"
                value={formatDate(selectedGroupDetails?.createdDate) ?? "N/A"}
                color="#525f7f"
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  });

  const StatItem = ({ icon, label, value, color }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        borderRadius: "12px",
        backgroundColor: "rgba(94, 114, 228, 0.05)",
        border: "1px solid rgba(94, 114, 228, 0.1)",
      }}
    >
      {icon}
      <Box>
        <Typography
          variant="caption"
          sx={{ color: "#8898aa", display: "block" }}
        >
          {label}
        </Typography>
        <Typography sx={{ color: color, fontWeight: 600, fontSize: "0.9rem" }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  const getCategoryInfo = (category) => {
    switch (category?.toLowerCase()) {
      case "home":
        return {
          icon: <HomeIcon />,
          label: "Home Groups",
          color: "#2dce89",
          gradient: "linear-gradient(135deg, #2dce89 0%, #2fcca0 100%)",
          lightBg: "rgba(45, 206, 137, 0.1)",
          emoji: "🏠",
        };
      case "trip":
        return {
          icon: <FlightIcon />,
          label: "Trip Groups",
          color: "#fb6340",
          gradient: "linear-gradient(135deg, #fb6340 0%, #fbb140 100%)",
          lightBg: "rgba(251, 99, 64, 0.1)",
          emoji: "✈️",
        };
      case "couple":
        return {
          icon: <FavoriteIcon />,
          label: "Couple Groups",
          color: "#f5365c",
          gradient: "linear-gradient(135deg, #f5365c 0%, #f56036 100%)",
          lightBg: "rgba(245, 54, 92, 0.1)",
          emoji: "💑",
        };
      case "settled":
        return {
          icon: <CheckCircleIcon />,
          label: "Settled Groups",
          color: "#8898aa",
          gradient: "linear-gradient(135deg, #8898aa 0%, #99a6b5 100%)",
          lightBg: "rgba(136, 152, 170, 0.1)",
          emoji: "✅",
        };
      default:
        return {
          icon: <CategoryIcon />,
          label: "Other Groups",
          color: "#5e72e4",
          gradient: "linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)",
          lightBg: "rgba(94, 114, 228, 0.1)",
          emoji: "📁",
        };
    }
  };

  const groupedItems = useMemo(() => {
    const categorized = allGroups?.reduce((acc, group) => {
      // Check if all members in the group are settled
      const isGroupSettled = group.members?.every(
        (member) => member.userSettled
      );

      // First categorize non-settled groups
      if (!isGroupSettled) {
        const category = group.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(group);
      }
      // Then add settled groups to a separate category
      else {
        if (!acc["Settled"]) {
          acc["Settled"] = [];
        }
        acc["Settled"].push(group);
      }
      return acc;
    }, {});

    // If there are settled groups, ensure they appear last
    if (categorized?.Settled) {
      const settled = categorized.Settled;
      delete categorized.Settled;
      categorized.Settled = settled;
    }

    return categorized;
  }, [allGroups]);

  const [activeUsers, setActiveUsers] = useState([]);

  // Add presence effect
  useEffect(() => {
    if (!currentGroupID || !currentUser) return;

    // Update user's presence
    const updatePresence = async () => {
      await presenceService.updatePresence(currentGroupID, currentUser.email, {
        name: currentUser.name,
        profilePicture: currentUser.profilePicture,
      });
    };

    // Initial presence update
    updatePresence();
    
    // Update presence more frequently (every 10 seconds)
    const interval = setInterval(updatePresence, 10000);

    // Subscribe to presence updates
    const unsubscribe = presenceService.subscribeToPresence(
      currentGroupID,
      currentUser.email,
      (users) => {
        setActiveUsers(users);
      }
    );

    // Cleanup function
    const handleBeforeUnload = () => {
      presenceService.removePresence(currentGroupID, currentUser.email);
    };

    // Add beforeunload event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      presenceService.removePresence(currentGroupID, currentUser.email);
    };
  }, [currentGroupID, currentUser]);

  // Find where you render the group header section and add this component:
  const ActiveUsersDisplay = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        ml: 2,
      }}
    >
      <AvatarGroup
        max={3}
        sx={{
          "& .MuiAvatar-root": {
            width: 30,
            height: 30,
            fontSize: "0.875rem",
            border: "2px solid #fff",
          },
        }}
      >
        {activeUsers.map((user) => (
          <Tooltip
            key={user.id}
            title={`${user.name} (Active)`}
            arrow
          >
            <StyledBadge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              variant="dot"
            >
              <Avatar
                alt={user.name}
                src={user.profilePicture}
                sx={{ width: 30, height: 30 }}
              >
                {user.name?.[0]}
              </Avatar>
            </StyledBadge>
          </Tooltip>
        ))}
      </AvatarGroup>
      {activeUsers.length > 0 && (
        <Typography
          variant="caption"
          sx={{
            color: "#525f7f",
            fontSize: "0.75rem",
          }}
        >
          {activeUsers.length} active now
        </Typography>
      )}
    </Box>
  );

  // Find the Box component that contains the group header and add ActiveUsersDisplay:
  return (
    <Box
      sx={{
        width: "100%",
        boxShadow: 3,
        borderRadius: 2,
        mt: isMobile ? 5 : 1,
        height: "calc(100vh - 135px)", // Dynamically calculate height (subtract header/footer height)
        overflow: "hidden", // Prevent content overflow
        display: "flex", // Ensure proper layout for child components
        flexDirection: "column", // Stack child components vertically
      }}
    >
      {allUserSettled && (
        <Box
          sx={{
            mx: { xs: 1.5, sm: 2 },
            my: { xs: 1, sm: 1.5 },
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: 45, sm: 50 },
            borderRadius: "12px",
            background: "linear-gradient(120deg, #4CAF50 0%, #45B649 100%)",
            overflow: "hidden",
            animation: "slideDown 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            "@keyframes slideDown": {
              from: { transform: "translateY(-100%)", opacity: 0 },
              to: { transform: "translateY(0)", opacity: 1 },
            },
          }}
        >
          {/* Success Icon */}
          <Box
            sx={{
              position: "absolute",
              left: { xs: "15px", sm: "20px" },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: { xs: "32px", sm: "36px" },
              height: { xs: "32px", sm: "36px" },
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%": {
                  transform: "scale(1)",
                  boxShadow: "0 0 0 0 rgba(255, 255, 255, 0.4)",
                },
                "70%": {
                  transform: "scale(1.1)",
                  boxShadow: "0 0 0 10px rgba(255, 255, 255, 0)",
                },
                "100%": {
                  transform: "scale(1)",
                  boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
                },
              },
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "1.2rem", sm: "1.3rem" },
                color: "white",
                fontWeight: "bold",
              }}
            >
              ✓
            </Typography>
          </Box>

          {/* Message */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "flex-start", sm: "center" },
              ml: { xs: "55px", sm: 0 },
              color: "white",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontWeight: 600,
                textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Group settled successfully!
            </Typography>
          </Box>

          {/* Confetti Effect */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              opacity: 0.2,
              backgroundImage: `
                radial-gradient(circle at 20% -50%, white 6px, transparent 8px),
                radial-gradient(circle at 75% 150%, white 6px, transparent 8px),
                radial-gradient(circle at 100% 50%, white 4px, transparent 6px),
                radial-gradient(circle at 50% -20%, white 4px, transparent 6px),
                radial-gradient(circle at 0% 80%, white 3px, transparent 4px)
              `,
              backgroundSize: "80px 80px",
              animation: "confetti 3s linear infinite",
              "@keyframes confetti": {
                "0%": { backgroundPosition: "0 0" },
                "100%": { backgroundPosition: "80px 80px" },
              },
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
            sx={{
              width: isMobile ? "60%" : "25%",
              maxWidth: { xs: "250px", sm: "300px" },
              minWidth: { xs: "180px", sm: "200px" },
              "& .MuiOutlinedInput-root": {
                transition: "all 0.3s ease",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(94, 114, 228, 0.2)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 4px 20px rgba(94, 114, 228, 0.15)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(94, 114, 228, 0.2)",
                  borderColor: "#5e72e4",
                  backgroundColor: "white",
                },
              },
            }}
          >
            <CustomSelect
              value={currentGroupID || ""}
              onChange={handleGroupChange}
              IconComponent={(props) => (
                <KeyboardArrowDownIcon
                  {...props}
                  sx={{
                    color: "#5e72e4",
                    transition: "transform 0.3s ease",
                    transform: props.className.includes("Mui-focused")
                      ? "rotate(-180deg)"
                      : "rotate(0)",
                  }}
                />
              )}
              displayEmpty
              renderValue={(selected) => (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    overflow: "hidden",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: "#5e72e4",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {selectedGroupDetails?.title?.[0] || "G"}
                  </Avatar>
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "#525f7f",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {selectedGroupDetails?.title ?? "Select Group"}
                  </Typography>
                </Box>
              )}
              sx={{
                height: "45px",
                "& .MuiSelect-select": {
                  paddingY: "8px",
                  width: "100%",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    mt: 1,
                    borderRadius: "20px",
                    maxHeight: { xs: "60vh", sm: "70vh" },
                    minWidth: { xs: "280px", sm: "320px", md: "360px" },
                    maxWidth: "90vw",
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 8px 32px rgba(94, 114, 228, 0.15)",
                    padding: { xs: 1, sm: 2 },
                    ".MuiMenuItem-root": {
                      borderRadius: "16px",
                      margin: "4px 0",
                      transition: "all 0.2s ease",
                    },
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(94, 114, 228, 0.2)",
                      borderRadius: "10px",
                    },
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
            >
              {Object.entries(groupedItems || {}).map(([category, groups]) => [
                <Box
                  key={`category-${category}`}
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    background: getCategoryInfo(category).gradient,
                    color: "white",
                    borderRadius: "12px",
                    margin: "8px 4px",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    backdropFilter: "blur(8px)",
                    transform: "scale(0.98)",
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 1, sm: 1.5 },
                    }}
                  >
                    {getCategoryInfo(category).icon}
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.9rem" },
                        fontWeight: 700,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {getCategoryInfo(category).label} ({groups.length})
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "1.2rem", sm: "1.4rem" },
                      marginLeft: "auto",
                    }}
                  >
                    {getCategoryInfo(category).emoji}
                  </Typography>
                </Box>,
                ...groups
                  // Sort groups by createdDate descending (latest first), handling Firestore Timestamp
                  .slice()
                  .sort((a, b) => {
                    const getGroupDate = (g) => {
                      if (
                        g.createdDate &&
                        typeof g.createdDate === "object" &&
                        "seconds" in g.createdDate
                      ) {
                        return new Date(
                          g.createdDate.seconds * 1000 +
                            Math.floor(g.createdDate.nanoseconds / 1e6)
                        );
                      }
                      return new Date(g.createdDate || 0);
                    };
                    return getGroupDate(b) - getGroupDate(a);
                  })
                  .map((group) => (
                    <MenuItem
                      key={group.id}
                      value={group.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        padding: { xs: "12px", sm: "16px" },
                        gap: { xs: 1.5, sm: 2 },
                        transition: "all 0.3s ease",
                        background:
                          category === "Settled"
                            ? "rgba(136, 152, 170, 0.05)"
                            : "rgba(255,255,255,0.8)",
                        border: "1px solid rgba(255,255,255,0.9)",
                        backdropFilter: "blur(8px)",
                        opacity: category === "Settled" ? 0.8 : 1,
                        "&:hover": {
                          backgroundColor: getCategoryInfo(category).lightBg,
                          transform: "translateX(8px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                        "&.Mui-selected": {
                          backgroundColor: getCategoryInfo(category).lightBg,
                          "&:hover": {
                            backgroundColor: getCategoryInfo(category).lightBg,
                            opacity: 0.9,
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1.5, sm: 2 },
                          width: "100%",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: { xs: 40, sm: 45 },
                            height: { xs: 40, sm: 45 },
                            background: getCategoryInfo(category).gradient,
                            fontSize: { xs: "1rem", sm: "1.2rem" },
                            fontWeight: 600,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            border: "2px solid #fff",
                          }}
                        >
                          {group.title[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 600,
                                color: "#32325d",
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                lineHeight: "1.2",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: {
                                  xs: "120px",
                                  sm: "150px",
                                  md: "200px",
                                },
                              }}
                            >
                              {group.title}
                            </Typography>
                            {group.admin?.email === currentUser?.email && (
                              <Chip
                                label="Admin"
                                size="small"
                                sx={{
                                  height: { xs: 18, sm: 20 },
                                  fontSize: { xs: "0.6rem", sm: "0.65rem" },
                                  backgroundColor:
                                    getCategoryInfo(category).lightBg,
                                  color: getCategoryInfo(category).color,
                                  fontWeight: 600,
                                  px: 0.5,
                                }}
                              />
                            )}
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: { xs: 1.5, sm: 2 },
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#8898aa",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                              }}
                            >
                              <GroupIcon
                                sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                              />
                              {group.members?.length || 0}
                            </Typography>
                            {group.expenses?.length > 0 && (
                              <Typography
                                sx={{
                                  color: "#8898aa",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                                }}
                              >
                                <PaidIcon
                                  sx={{
                                    fontSize: { xs: "0.9rem", sm: "1rem" },
                                  }}
                                />
                                {group.expenses.length}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </MenuItem>
                  )),
              ])}
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
          <Box
            sx={{
              p: 2,
              height: "calc(100% - 180px)", // Subtract header height and tabs height
              overflow: "hidden", // Change from "auto" to "hidden"
              "& > *": {
                // This ensures all child components (tabs) take full height
                height: "100%",
                overflow: "hidden", // Change from "auto" to "hidden"
              },
            }}
          >
            {dynamicTabs[tabIndex]?.component}
          </Box>
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
