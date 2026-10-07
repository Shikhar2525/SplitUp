import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddExpenseButton from "../AddExpense/AddExpenseModal";
import PaidIcon from "@mui/icons-material/Paid";
import BalanceIcon from "@mui/icons-material/Balance";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import Expenses from "../Expenses/Expenses";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import NoDataScreen from "../NoDataScreen/NoDataScreen";
import { convertCurrency, formatCurrency, formatDisplayName, formatDate, formatDateWithOrdinal, getGroupColor, sortByISODate } from "../utils";
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
import userService from "../services/user.service";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import ShareLink from "../ShareLink/ShareLink";
import GroupComponent from "../JoinGroup/JoinGroup";
import { useAllUserSettled } from "../contexts/AllUserSettled";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Notes from "../Notes/Notes";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar";
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
import Tooltip from "@mui/material/Tooltip";
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
  const [expenseNavigation, setExpenseNavigation] = useState(
    /** @type {{ expenseId: string, requestId: number } | null} */ (null)
  );

  const handleExpenseNavigation = useCallback(
    /** @type {(expenseId: string) => void} */
    (expenseId) => {
      setExpenseNavigation((previous) => ({
        expenseId,
        requestId: (previous?.requestId || 0) + 1,
      }));
      setTabIndex(0);
    },
    []
  );
  const { setLinearProgress } = useLinearProgress();

  const [settledMemberStats, setSettledMemberStats] = useState({});
  const [groupsIDs, setGroupIDs] = useState([]);
  const { currentCurrency, setCurrentCurrency } = useCurrentCurrency();
  const { setSnackBar } = useTopSnackBar();
  const appliedGroupCurrency = useRef("");
  const { allUserSettled, setAllUserSettled } = useAllUserSettled();

  const title = allGroups?.find((group) => group.id === currentGroupID)?.title;
  const currentGroup = allGroups?.find((group) => group.id === currentGroupID);
  const currentGroupColor = getGroupColor(currentGroup, allGroups || []);
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
      // Create an array of promises to fetch users
      const memberPromises = currentGroup?.members?.map(async (member) => {
        if (member?.isDummy) return member;
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
      }, (prevProps, nextProps) => {
    // Only re-render if selectedGroupDetails changes
    // Ignore changes in activeUsersRef since we handle that separately
    return JSON.stringify(prevProps.selectedGroupDetails) === JSON.stringify(nextProps.selectedGroupDetails);
  });

      // Wait for all promises to resolve
      const newMembers = await Promise.all(memberPromises);

      const expensePromises = currentGroup?.expenses?.map(async (expense) => {
        const paidByUser = expense.paidBy?.isDummy
          ? null
          : await fetchUser(expense.paidBy?.email);

        const splitPromises = expense.splitBetween.map(async (splitOption) => {
          if (splitOption?.isDummy) return splitOption;
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
    if (!currentGroup) return;

    const groupCurrency = currentGroup.defaultCurrency || "INR";
    const groupCurrencyKey = `${currentGroup.id}:${groupCurrency}`;
    if (appliedGroupCurrency.current === groupCurrencyKey) return;

    appliedGroupCurrency.current = groupCurrencyKey;
    if (currentCurrency !== groupCurrency) {
      setCurrentCurrency(groupCurrency);
      setSnackBar({
        isOpen: true,
        message: `Currency changed to ${groupCurrency} for ${currentGroup.title || "this group"}.`,
      });
    }
  }, [currentGroup?.id, currentGroup?.defaultCurrency, currentCurrency, setCurrentCurrency, setSnackBar]);

  const dynamicTabs = useMemo(() => {
    const tabs = [
      {
        label: "Expenses",
        icon: <PaidIcon />,
        component: <Expenses targetExpense={expenseNavigation} />,
      },
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
    if (
      (currentGroupAdminEmail || "").trim().toLowerCase() ===
      (currentUser?.email || "").trim().toLowerCase()
    ) {
      tabs.push({
        label: "Settings",
        icon: <SettingsIcon />,
        component: (
          <GroupsSettings
            groupID={currentGroupID}
            groupName={currentGroup?.title}
            defaultCurrency={currentGroup?.defaultCurrency}
            group={currentGroup}
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
    expenseNavigation,
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

  // Use React.memo to prevent unnecessary re-renders
    const GroupInfoBar = React.memo(({ selectedGroupDetails }) => {
    const { currentCurrency } = useCurrentCurrency();
    const { currentUser } = useCurrentUser();
    const [convertedTotal, setConvertedTotal] = useState(0);
    const [myTotalShare, setMyTotalShare] = useState(0);
    const [myDebitedExpenses, setMyDebitedExpenses] = useState([]);
    const [expensesDialogOpen, setExpensesDialogOpen] = useState(false);
    const [selectedExpenseEmail, setSelectedExpenseEmail] = useState(currentUser?.email || "");
    const [expanded, setExpanded] = useState(false);
    /** @type {any[]} */
    const groupMembers = selectedGroupDetails?.members || [];
    const isGroupAdmin =
      (selectedGroupDetails?.admin?.email || "").trim().toLowerCase() ===
      (currentUser?.email || "").trim().toLowerCase();
    const selectedExpenseMember = groupMembers.find(
      /** @param {any} candidate */
      (candidate) =>
        (candidate?.email || "").trim().toLowerCase() ===
        (selectedExpenseEmail || "").trim().toLowerCase()
    );
    const selectedExpenseName =
      formatDisplayName(selectedExpenseMember?.name || selectedExpenseMember?.email || "you");
    
    const handleAccordionChange = (event, isExpanded) => {
      setExpanded(isExpanded);
    };

    const openExpensesDialog = () => {
      setSelectedExpenseEmail(currentUser?.email || "");
      setExpensesDialogOpen(true);
    };
    const closeExpensesDialog = () => setExpensesDialogOpen(false);
    


    useEffect(() => {
      const calculateTotalAmount = async () => {
        let totalInCurrentCurrency = 0;
        let myTotalExpenses = 0;
        const debited = [];

        if (selectedGroupDetails?.expenses) {
          const expensesInTabOrder = sortByISODate([
            ...selectedGroupDetails.expenses,
          ]);
          for (const expense of expensesInTabOrder) {
            try {
              const { amount: convertedAmount } = await convertCurrency(
                expense.amount,
                expense.currency || selectedGroupDetails.defaultCurrency,
                currentCurrency
              );

              totalInCurrentCurrency += parseFloat(convertedAmount);

              // Calculate my total expenses (only count when I'm included in the split)
              const memberEmail = (selectedExpenseEmail || "").toLowerCase();
              const splitBetween = expense.splitBetween || [];
              const isInSplit = splitBetween.some(
                (member) => (member?.email || "").toLowerCase() === memberEmail
              );
              const payerIsMe =
                (expense.paidBy?.email || "").toLowerCase() === memberEmail;

              const splitCount = expense.excludePayer
                ? splitBetween.length
                : splitBetween.length + 1;
              if (splitCount <= 0) continue;

              // If I'm explicitly in splitBetween, add my share.
              // Otherwise, if I'm the payer and the payer is included (excludePayer is false),
              // add my implicit share. Do not count if payer is excluded from split.
              if (isInSplit) {
                const myShare = parseFloat(convertedAmount) / splitCount;
                myTotalExpenses += myShare;
                debited.push({
                  id: expense.id,
                  description: expense.description || "Untitled expense",
                  totalAmount: parseFloat(convertedAmount),
                  myShare,
                  paidByName: expense.paidBy?.name || expense.paidBy?.email || "Unknown",
                  date: expense.createdDate || expense.date || "",
                  currency: currentCurrency,
                });
              } else if (payerIsMe && !expense.excludePayer) {
                const myShare = parseFloat(convertedAmount) / splitCount;
                myTotalExpenses += myShare;
                debited.push({
                  id: expense.id,
                  description: expense.description || "Untitled expense",
                  totalAmount: parseFloat(convertedAmount),
                  myShare,
                  paidByName: expense.paidBy?.name || expense.paidBy?.email || "Unknown",
                  date: expense.createdDate || expense.date || "",
                  currency: currentCurrency,
                });
              }
            } catch (error) {
              console.error("Currency conversion error:", error);
            }
          }
        }

        setConvertedTotal(totalInCurrentCurrency);
        setMyTotalShare(myTotalExpenses);
        setMyDebitedExpenses(debited);
      };

      calculateTotalAmount();
    }, [selectedGroupDetails, currentCurrency, currentUser, selectedExpenseEmail]);

    return (
      <Box
        sx={{
          px: { xs: 0.5, sm: 1 },
          py: 0.75,
        }}
      >
        <Accordion
          expanded={expanded}
          onChange={handleAccordionChange}
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
                value={formatCurrency(convertedTotal, currentCurrency)}
                color="#5e72e4"
              />

              <StatItem
                icon={<AccountBalanceWalletIcon sx={{ color: "#2dce89" }} />}
                label="My Total Expenses"
                value={formatCurrency(myTotalShare, currentCurrency)}
                hint="Click to view your debited expenses"
                color="#2dce89"
                onClick={openExpensesDialog}
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

        <Dialog
          open={expensesDialogOpen}
          onClose={closeExpensesDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.15)",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, px: 3, py: 2, backgroundColor: "#f8fafc" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {isGroupAdmin ? `${selectedExpenseName}'s Expenses` : "My Debited Expenses"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Review the expenses included in this member’s total and their share amount.
              </Typography>
              {isGroupAdmin && (
                <FormControl size="small" fullWidth sx={{ mt: 1.5, maxWidth: 360 }}>
                  <Select
                    value={selectedExpenseEmail}
                    onChange={(event) => setSelectedExpenseEmail(event.target.value)}
                    displayEmpty
                    renderValue={(email) => {
                      const member = groupMembers.find(
                        (candidate) => candidate?.email === email
                      );

                      return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <ProfileAvatar user={member} name={formatDisplayName(member?.name)} sx={{ width: 28, height: 28 }} />
                          <Typography noWrap>{formatDisplayName(member?.name || email)}</Typography>
                        </Box>
                      );
                    }}
                    inputProps={{ "aria-label": "Select a group member" }}
                    sx={{ backgroundColor: "white", borderRadius: 2 }}
                  >
                    {groupMembers.map((member) => (
                      <MenuItem key={member.email} value={member.email}>
                        <ProfileAvatar
                          user={member}
                          name={formatDisplayName(member?.name)}
                          sx={{ width: 32, height: 32, mr: 1.25 }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap>{formatDisplayName(member.name || member.email)}</Typography>
                          {member.name && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {member.email}
                            </Typography>
                          )}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
            <IconButton onClick={closeExpensesDialog} size="small" sx={{ color: "#475569" }}>
              ×
            </IconButton>
          </Box>
          <Divider />
          <DialogContent sx={{ p: 0, backgroundColor: "#ffffff" }}>
            <Box sx={{ m: 2, mb: 0, p: 2, borderRadius: 3, backgroundColor: "rgba(45, 206, 137, 0.08)", border: "1px solid rgba(45, 206, 137, 0.25)" }}>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {isGroupAdmin ? `${selectedExpenseName}'s total expense` : "Your total expense"}
              </Typography>
              <Typography sx={{ color: "#16a34a", fontWeight: 700, fontSize: "1.15rem" }}>
                {formatCurrency(myTotalShare, currentCurrency)}
              </Typography>
            </Box>
            {myDebitedExpenses.length > 0 ? (
              <Box sx={{ display: "grid", gap: 2, p: 2 }}>
                {myDebitedExpenses.map((item) => (
                  <Box
                    component="button"
                    key={item.id}
                    type="button"
                    onClick={() => {
                      closeExpensesDialog();
                      handleExpenseNavigation(item.id);
                    }}
                    aria-label={`Open expense ${item.description}`}
                    sx={{
                      width: "100%",
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: "#f9fafb",
                      border: "1px solid rgba(148, 163, 184, 0.2)",
                      textAlign: "left",
                      font: "inherit",
                      cursor: "pointer",
                      transition: "background-color 150ms ease, border-color 150ms ease",
                      "&:hover": {
                        backgroundColor: "#f1f5f9",
                        borderColor: "rgba(94, 114, 228, 0.35)",
                      },
                      "&:focus-visible": {
                        outline: "3px solid rgba(94, 114, 228, 0.35)",
                        outlineOffset: 2,
                      },
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", mb: 0.75 }}>
                      {item.description}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", mb: 1.5 }}>
                      Paid by {item.paidByName} • {item.date ? formatDateWithOrdinal(item.date) : "Date not available"}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, gap: 1 }}>
                      <Typography variant="body2" sx={{ color: "#334155", fontWeight: 600 }}>
                        Total: {formatCurrency(item.totalAmount, item.currency)}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#16a34a" }}>
                        {isGroupAdmin ? `${selectedExpenseName}'s share` : "Your share"}: {formatCurrency(item.myShare, item.currency)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography sx={{ color: "#64748b" }}>
                  No debited expenses were found for {isGroupAdmin ? selectedExpenseName : "your account"}.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
            <Button onClick={closeExpensesDialog} variant="contained" sx={{ textTransform: "none", borderRadius: 3, px: 3 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if selectedGroupDetails changes
    // Ignore changes in activeUsersRef since we handle that separately
    return JSON.stringify(prevProps.selectedGroupDetails) === JSON.stringify(nextProps.selectedGroupDetails);
  });

  const StatItem = ({ icon, label, value, hint, color, onClick }) => (
    <Box
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 1.5,
        borderRadius: "16px",
        backgroundColor: onClick ? "rgba(45, 206, 137, 0.08)" : "rgba(94, 114, 228, 0.05)",
        border: onClick ? "1px solid rgba(45, 206, 137, 0.25)" : "1px solid rgba(94, 114, 228, 0.1)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        '&:hover': onClick ? { backgroundColor: "rgba(45, 206, 137, 0.12)", transform: "translateY(-1px)" } : {},
      }}
    >
      {icon}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "#8898aa", display: "block" }}>
          {label}
        </Typography>
        <Typography sx={{ color: color, fontWeight: 700, fontSize: "0.95rem" }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ color: "#4b5563", display: "block", mt: 0.5 }}>
            {hint}
          </Typography>
        )}
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

  // Active users functionality has been removed

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
          px: { xs: 1.25, sm: 2 },
          py: { xs: 1, sm: 1.25 },
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "minmax(220px, 320px) minmax(0, 1fr)",
          },
          columnGap: { xs: 0.75, sm: 2 },
          rowGap: { xs: 1, sm: 0 },
          alignItems: "center",
          borderBottom: `1px solid ${currentGroupColor.surface}`,
          borderLeft: `4px solid ${currentGroupColor.value}`,
          background: `linear-gradient(105deg, ${currentGroupColor.surface} 0%, #f8fafc 100%)`,
        }}
      >
        {allGroups?.length > 0 ? (
          <FormControl
            fullWidth
            variant="outlined"
            sx={{
              width: "100%",
              maxWidth: "none",
              minWidth: 0,
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
                      bgcolor: currentGroupColor.value,
                      color: "#fff",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      flexShrink: 0,
                      border: "1px solid rgba(255,255,255,0.8)",
                    }}
                  >
                    {selectedGroupDetails?.title?.[0] || "G"}
                  </Avatar>
                  <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, lineHeight: 1.15 }}>
                    <Typography
                      sx={{
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        fontWeight: 700,
                        color: "#263449",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedGroupDetails?.title ?? "Select Group"}
                    </Typography>
                    {selectedGroupDetails?.description && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", mt: 0.25 }}
                      >
                        {selectedGroupDetails.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              sx={{
                height: { xs: 52, sm: 56 },
                borderRadius: "11px",
                backgroundColor: "#fff",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#d9e0eb",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#9aa8c2",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#5e72e4",
                  borderWidth: 1,
                },
                "& .MuiSelect-select": {
                  py: 0.75,
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
                          backgroundColor: getGroupColor(group, allGroups || []).surface,
                          transform: "translateX(8px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                        "&.Mui-selected": {
                          backgroundColor: getGroupColor(group, allGroups || []).surface,
                          "&:hover": {
                            backgroundColor: getGroupColor(group, allGroups || []).surface,
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
                            backgroundColor: getGroupColor(group, allGroups || []).value,
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
                          {group.description && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 2,
                                overflow: "hidden",
                                color: "#64748b",
                                lineHeight: 1.25,
                                mt: 0.4,
                                maxWidth: { xs: 220, sm: 260 },
                              }}
                            >
                              {group.description}
                            </Typography>
                          )}
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
        <Box
          sx={{
            gridColumn: { xs: "1 / -1", sm: "2" },
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            gap: { xs: 1, sm: 1.5 },
            minWidth: 0,
            width: "100%",
          }}
        >
          <Button
            size="small"
            variant="contained"
            startIcon={<PaidIcon />}
            onClick={() => setModelOpen(true)}
            aria-label="Add expense"
            sx={{
              flexGrow: 0,
              minHeight: { xs: 40, sm: 42 },
              px: { xs: 1.1, sm: 1.5 },
              whiteSpace: "nowrap",
              fontSize: { xs: "0.78rem", sm: "0.82rem" },
              fontWeight: 700,
              textTransform: "none",
              backgroundColor: "#5e72e4",
              borderRadius: "11px",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(65, 84, 180, 0.22)",
              "&:hover": {
                backgroundColor: "#4f62cb",
                boxShadow: "0 4px 10px rgba(65, 84, 180, 0.26)",
              },
              "& .MuiButton-startIcon": { mr: 0.75 },
            }}
          >
            Add expense
          </Button>
          {allGroups?.length > 0 && (
            <Button
              onClick={toggleMembersModal}
              variant="outlined"
              startIcon={<Groups2Icon />}
              aria-label={`View ${selectedGroupDetails?.members?.length || 0} group members`}
              sx={{
                minWidth: { xs: 42, sm: 112 },
                minHeight: { xs: 42, sm: 44 },
                px: { xs: 1, sm: 1.5 },
                borderRadius: "11px",
                borderColor: "#d9e0eb",
                color: "#475569",
                fontSize: "0.8rem",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#aab5c8",
                  backgroundColor: "#f8fafc",
                },
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.75 } },
              }}
            >
              {isMobile ? selectedGroupDetails?.members?.length || 0 : "Members"}
            </Button>
          )}
          {allGroups?.length > 0 && <ShareLink />}
        </Box>
      </Box>

      {allGroups?.length > 0 ? (
        <>
          <GroupInfoBar 
            selectedGroupDetails={selectedGroupDetails}
          />
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

export default GroupTab;
