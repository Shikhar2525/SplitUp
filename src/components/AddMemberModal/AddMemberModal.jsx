import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
  Avatar,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import GroupService from "../services/group.service";
import userService from "../services/user.service";
import { useAllGroups } from "../contexts/AllGroups";
import { useLinearProgress } from "../contexts/LinearProgress";
import groupService from "../services/group.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import activityService from "../services/activity.service";
import { v4 as uuidv4 } from "uuid";
import { useFriends } from "../contexts/FriendsContext";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar";
import { createCalculationOnlyMember, formatDisplayName } from "../utils";

const styles = {
  modalBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "calc(100% - 24px)", sm: "min(540px, calc(100% - 40px))" },
    maxWidth: 540,
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    bgcolor: "#FFF",
    borderRadius: { xs: "18px", sm: "20px" },
    boxShadow: "0 24px 64px rgba(15, 23, 42, 0.2)",
    p: 0,
  },
  header: {
    p: { xs: 2, sm: 2.5 },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e8edf3",
  },
  content: {
    p: { xs: 2, sm: 2.5 },
    overflowY: "auto",
    flex: 1,
    backgroundColor: "#fff",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(94, 114, 228, 0.2)",
      borderRadius: "10px",
    },
  },
  membersList: {
    maxHeight: "30vh",
    overflowY: "auto",
    mb: 2.5,
    border: "1px solid #e5eaf1",
    borderRadius: "12px",
    backgroundColor: "#fff",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(94, 114, 228, 0.2)",
      borderRadius: "10px",
    },
  },
  memberCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 1.25,
    py: 1,
    borderBottom: "1px solid #edf1f5",
    transition: "background-color 150ms ease",
    "&:hover": {
      backgroundColor: "#f8fafc",
    },
    "&:last-child": {
      borderBottom: 0,
    },
  },
  searchInput: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#fff",
      transition: "border-color 150ms ease, box-shadow 150ms ease",
      "&:hover": {
        backgroundColor: "#fff",
      },
      "&.Mui-focused": {
        backgroundColor: "#fff",
      },
    },
  },
  suggestionsBox: {
    position: "absolute",
    width: "100%",
    maxHeight: "250px",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    zIndex: 1000,
    border: "1px solid rgba(94, 114, 228, 0.2)",
    overflow: "auto",
    mt: 1,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(94, 114, 228, 0.2)",
      borderRadius: "10px",
    },
  },
  suggestionItem: {
    p: { xs: 1.25, sm: 1.5 },
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    transition: "background-color 150ms ease",
    "&:hover": {
      backgroundColor: "#f8faff",
    },
  },
  footer: {
    p: { xs: 1.5, sm: 2 },
    borderTop: "1px solid #e8edf3",
    backgroundColor: "#fff",
  },
  addButton: {
    bgcolor: "#5e72e4",
    color: "white",
    borderRadius: "10px",
    textTransform: "none",
    px: 2.5,
    minHeight: 42,
    fontWeight: 700,
    "&:hover": {
      bgcolor: "#4b5cc4",
    },
    "&.Mui-disabled": {
      bgcolor: "rgba(94, 114, 228, 0.3)",
    },
  },
  chip: {
    m: 0.25,
    borderRadius: "9px",
    backgroundColor: "#f1f3ff",
    border: "1px solid #e0e5ff",
    "& .MuiChip-label": {
      color: "#5e72e4",
      fontWeight: 600,
    },
    "& .MuiChip-deleteIcon": {
      color: "#5e72e4",
    },
  },
};

const AddMemberModal = ({ open, handleClose, existingMembers }) => {
  const [inputEmail, setInputEmail] = useState("");
  const [members, setMembers] = useState([]); // Store both email and avatar
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [dummyName, setDummyName] = useState("");
  const [dummyEntryOpen, setDummyEntryOpen] = useState(false);
  const [dummyAdding, setDummyAdding] = useState(false);
  const [showNameField, setShowNameField] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // To store selected member for deletion
  const [confirmationOpen, setConfirmationOpen] = useState(false); // To handle confirmation dialog
  const { currentGroupID } = useCurrentGroup(); // Use currentGroup to display its title
  const { setLinearProgress } = useLinearProgress();
  const { refreshAllGroups } = useAllGroups();
  const { allGroups } = useAllGroups();
  const { currentUser } = useCurrentUser();
  const { setSnackBar } = useTopSnackBar();
  const { userFriends, refreshFriends } = useFriends();
  const [suggestions, setSuggestions] = useState([]);
  const currentGroupObj = allGroups.find(
    (group) => group?.id === currentGroupID
  );
  const isCurrentUserAdmin = currentUser?.email === currentGroupObj?.admin?.email;
  const userObjWithName = { email: inputEmail, name: name };

  useEffect(() => {
    if (open && currentUser?.email) {
      refreshFriends(currentUser.email);
    }
  }, [open, currentUser]);

  const resetAddMembers = (e) => {
    e.preventDefault();
    setShowNameField(false);
    setInputEmail("");
    setName("");
    setDummyName("");
    setDummyEntryOpen(false);
    setError("");
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailAdd = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!validateEmail(inputEmail)) {
        return setError("Email is invalid.");
      }

      if (members.some((member) => member.email === inputEmail)) {
        return setError("This email is already added.");
      }

      setEmailLoading(true);

      try {
        // Check if the user already exists in the group
        const existingUser = await groupService.getUserFromGroup(
          currentGroupID,
          inputEmail
        );

        if (existingUser) {
          return setError("This email is already a member of the group.");
        }

        const user = await userService.getUserByEmail(inputEmail);
        if (user) {
          // Add user with avatar
          setMembers((prevMembers) => [...prevMembers, user]);
          setError("");
          setInputEmail("");
        } else {
          setShowNameField(true);
          setError("User not found, enter name");
        }
      } catch (err) {
        setError("Error fetching user.");
      } finally {
        setEmailLoading(false);
      }
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setInputEmail(value);
    setError("");

    if (value) {
      const filtered = userFriends.filter(
        (friend) =>
          // Don't show already added members or existing group members
          !members.some((member) => member.email === friend.email) &&
          !existingMembers.some((member) => member.email === friend.email) &&
          ((friend.name &&
            friend.name.toLowerCase().includes(value.toLowerCase())) ||
            friend.email.toLowerCase().includes(value.toLowerCase()))
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectFriend = (friend) => {
    if (!members.some((member) => member.email === friend.email)) {
      setMembers((prev) => [...prev, friend]);
    }
    setInputEmail("");
    setSuggestions([]);
    setError("");
  };

  const handleChipDelete = (member) => {
    // Directly remove the member from the local state
    setMembers((prevMembers) =>
      prevMembers.filter((m) => m.email !== member?.email)
    );
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member); // Store the selected member for confirmation
    setConfirmationOpen(true); // Open the confirmation dialog
  };

  const handleConfirmDelete = async () => {
    if (selectedMember?.email === currentGroupObj?.admin?.email) {
      setConfirmationOpen(false);
      setError("Cannot remove admin");
      return;
    }

    try {
      setLinearProgress(true);
      // First close the confirmation dialog
      setConfirmationOpen(false);
      
      // Then remove the member
      await GroupService.removeMemberFromGroup(
        currentGroupID,
        selectedMember?.email
      );

      const log = {
        logId: uuidv4(),
        logType: "deleteUser",
        details: {
          userAffected: {
            email: selectedMember?.email,
            name: selectedMember?.name,
          },
          performedBy: { email: currentUser?.email, name: currentUser?.name },
          date: new Date(),
          groupTitle: currentGroupObj?.title,
          groupId: currentGroupID,
        },
      };

      await activityService?.addActivityLog(log);
      setError(""); // Clear any errors
      refreshAllGroups(); // Refresh groups after deletion
    } catch (err) {
      setError("Failed to delete member. Please try again.");
    } finally {
      setSelectedMember(null); // Clear the selected member
      setLinearProgress(false);
    }
  };

  const handleName = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setMembers((prevMembers) => [
        ...prevMembers,
        { ...userObjWithName, isDummy: true },
      ]);
      setShowNameField(false);
      setInputEmail("");
      setError("");
    }
  };

  const handleAddCalculationOnlyMember = async () => {
    const trimmedName = dummyName.trim();
    if (!trimmedName) {
      setError("Enter a name for this calculation-only member.");
      return;
    }

    const usedEmails = [
      ...(existingMembers || []).map((member) => member?.email || ""),
      ...members.map((member) => member?.email || ""),
    ];
    const guest = createCalculationOnlyMember(trimmedName, usedEmails);
    setDummyAdding(true);

    try {
      await GroupService.addMemberToGroup(currentGroupID, guest);
      await activityService.addActivityLog({
        logId: uuidv4(),
        logType: "addUser",
        details: {
          userAffected: { email: guest.email, name: guest.name },
          performedBy: { email: currentUser?.email, name: currentUser?.name },
          date: new Date(),
          groupTitle: currentGroupObj?.title,
          groupId: currentGroupID,
        },
      });
      refreshAllGroups();
      setDummyName("");
      setDummyEntryOpen(false);
      setError("");
      setSnackBar({
        isOpen: true,
        message: `Added ${guest.name} as a calculation-only member.`,
      });
    } catch (addError) {
      setError("Could not add this calculation-only member. Please try again.");
    } finally {
      setDummyAdding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (members?.length === 0) {
      setError("Please add at least one member.");
      setLoading(false);
      return; // Prevent submitting if no members are added
    }

    try {
      for (const member of members) {
        await GroupService.addMemberToGroup(currentGroupID, member);
        const log = {
          logId: uuidv4(),
          logType: "addUser",
          details: {
            userAffected: { email: member?.email, name: member?.name },
            performedBy: { email: currentUser?.email, name: currentUser?.name },
            date: new Date(),
            groupTitle: currentGroupObj?.title,
            groupId: currentGroupID,
          },
        };
        await activityService?.addActivityLog(log);
      }

      setSnackBar({
        isOpen: true,
        message: `Added ${members.length} ${members.length === 1 ? "member" : "members"} to ${currentGroupObj?.title || "the group"}.`,
      });

      // Reset form fields but keep modal open
      setMembers([]);
      setInputEmail("");
      setShowNameField(false);
      setName("");
      setError("");
      refreshAllGroups(); // Refresh the group members
    } catch (error) {
      setError("Failed to add member(s). Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        handleClose();
        setError("");
      }}
    >
      <Box sx={styles.modalBox}>
        {/* Header */}
        <Box sx={styles.header}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: "#5e72e4", fontWeight: 700, lineHeight: 1.4 }}>
              Group members
            </Typography>
            <Typography variant="h6" sx={{ color: "#1e293b", fontWeight: 700, lineHeight: 1.25 }}>
              Manage members
            </Typography>
            <Typography variant="body2" noWrap sx={{ color: "#64748b", mt: 0.35 }}>
              {currentGroupObj?.title || "Current group"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
            <Chip
              label={`${existingMembers?.length || 0} members`}
              size="small"
              sx={{ backgroundColor: "#eef1ff", color: "#4f5fc7", fontWeight: 600 }}
            />
          <IconButton onClick={handleClose} size="small" aria-label="Close member manager">
            <CloseIcon />
          </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={styles.content}>
          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: "12px",
                "& .MuiAlert-icon": { color: "#f5365c" },
              }}
            >
              {error}
            </Alert>
          )}

          {/* Existing Members Section */}
          {existingMembers?.length > 0 && (
            <>
              <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: "#334155", fontWeight: 700 }}>
                  Current members
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  {existingMembers.length} in group
                </Typography>
              </Box>
              <Box sx={styles.membersList}>
                {existingMembers.map((member) => (
                  <Box key={member?.email} sx={styles.memberCard}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
                      <ProfileAvatar
                        user={member}
                        name={formatDisplayName(member?.name || member?.email)}
                        sx={{ width: 38, height: 38, flexShrink: 0 }}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ color: "#263449", fontWeight: 600 }}>
                            {formatDisplayName(member?.name || member?.email)}
                          </Typography>
                          {member?.email === currentGroupObj?.admin?.email && (
                            <Chip
                              label="Admin"
                              size="small"
                              sx={{ height: 20, backgroundColor: "#eef1ff", color: "#4f5fc7", fontSize: "0.65rem", fontWeight: 700 }}
                            />
                          )}
                          {member?.isDummy && (
                            <Chip
                              label="Calculation only"
                              size="small"
                              sx={{ height: 20, backgroundColor: "#f1f5f9", color: "#475569", fontSize: "0.62rem", fontWeight: 600 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" noWrap sx={{ display: "block", color: "#64748b" }}>
                          {member?.email}
                        </Typography>
                      </Box>
                    </Box>
                    {(currentUser?.email === currentGroupObj?.admin?.email ||
                      currentUser?.email === member?.email) && (
                      <Tooltip title="Remove member" arrow>
                        <IconButton
                          aria-label={`Remove ${formatDisplayName(member?.name || member?.email)}`}
                          size="small"
                          onClick={() => handleDeleteClick(member)}
                          sx={{ color: "#758198", ml: 1, flexShrink: 0, "&:hover": { color: "#d14352", backgroundColor: "#fff1f2" } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Box>
            </>
          )}

          {/* Add Members Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 1.25 }}>
              <Typography variant="subtitle2" sx={{ color: "#334155", fontWeight: 700 }}>
                Add people
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Search friends by name or enter an email address.
              </Typography>
            </Box>
            <Box sx={{ position: "relative" }}>
              <TextField
                disabled={!isCurrentUserAdmin || showNameField}
                fullWidth
                label="Name or email"
                variant="outlined"
                value={
                  currentUser?.email !== currentGroupObj?.admin?.email
                    ? ""
                    : inputEmail
                }
                onChange={handleEmailChange}
                onKeyDown={handleEmailAdd}
                helperText="Choose a friend or enter an email address."
                InputProps={{
                  startAdornment: members.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 0.5,
                        maxWidth: "100%",
                        py: 0.25,
                      }}
                    >
                      {members.map((member) => (
                        <Chip
                          key={member.email}
                          size="small"
                          label={`${formatDisplayName(member?.name || member?.email)}${member?.isDummy ? " · Calculation only" : ""}`}
                          avatar={
                            <ProfileAvatar
                              user={member}
                              alt={formatDisplayName(member?.name || member?.email)}
                              sx={{ width: 22, height: 22 }}
                            />
                          }
                          onDelete={() => handleChipDelete(member)}
                          sx={{ ...styles.chip, maxWidth: "100%", m: 0 }}
                        />
                      ))}
                    </Box>
                  ),
                }}
                sx={{
                  ...styles.searchInput,
                  "& .MuiOutlinedInput-root": {
                    ...styles.searchInput["& .MuiOutlinedInput-root"],
                    flexWrap: "wrap",
                    gap: 0.5,
                    py: 0.5,
                  },
                  "& .MuiInputBase-input": {
                    minWidth: 100,
                    flex: "1 1 120px",
                  },
                }}
              />

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && inputEmail && (
                <Box sx={styles.suggestionsBox}>
                  {suggestions.map((friend) => (
                    <Box
                      key={friend.email}
                      sx={styles.suggestionItem}
                      onClick={() => handleSelectFriend(friend)}
                    >
                      <ProfileAvatar
                        user={friend}
                        alt={formatDisplayName(friend.name)}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatDisplayName(friend.name)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {friend.email}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {showNameField && (
              <TextField
                fullWidth
                sx={{ ...styles.searchInput, mt: 2 }}
                label="Enter Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleName}
                helperText="Press Enter to add this unregistered member."
              />
            )}

            {isCurrentUserAdmin && (
              <Box sx={{ mt: 1.5 }}>
                {!dummyEntryOpen ? (
                  <Button
                    type="button"
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddAlt1Icon />}
                    onClick={() => {
                      setDummyEntryOpen(true);
                      setError("");
                    }}
                    sx={{
                      minHeight: 40,
                      borderRadius: "10px",
                      borderColor: "#c8d0e1",
                      color: "#4f5fc7",
                      fontWeight: 650,
                      textTransform: "none",
                      "&:hover": { borderColor: "#7d8bd1", backgroundColor: "#f7f8ff" },
                    }}
                  >
                    Add calculation-only member
                  </Button>
                ) : (
                  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <TextField
                      autoFocus
                      size="small"
                      fullWidth
                      label="Guest name"
                      value={dummyName}
                      onChange={(event) => setDummyName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddCalculationOnlyMember();
                        }
                      }}
                      helperText="No SplitUp account is needed."
                      sx={styles.searchInput}
                    />
                    <Button
                      type="button"
                      variant="contained"
                      disabled={!dummyName.trim() || dummyAdding}
                      onClick={handleAddCalculationOnlyMember}
                      sx={{ ...styles.addButton, minHeight: 40, px: 1.5, whiteSpace: "nowrap" }}
                    >
                      {dummyAdding ? (
                        <CircularProgress size={18} sx={{ color: "white" }} />
                      ) : (
                        "Add guest"
                      )}
                    </Button>
                  </Box>
                )}
              </Box>
            )}

          </form>

          {/* Admin Only Warning */}
          {currentUser?.email !== currentGroupObj?.admin?.email && (
            <Alert
              severity="info"
              sx={{
                mt: 2,
                borderRadius: "12px",
                backgroundColor: "rgba(94, 114, 228, 0.05)",
                "& .MuiAlert-icon": { color: "#5e72e4" },
              }}
            >
              Only admin can add/remove members
            </Alert>
          )}
        </Box>

        {/* Footer */}
        <Box sx={styles.footer}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Button
              variant="outlined"
              onClick={resetAddMembers}
              sx={{
                borderRadius: "12px",
                color: "#5e72e4",
                borderColor: "rgba(94, 114, 228, 0.5)",
                "&:hover": {
                  borderColor: "#5e72e4",
                  backgroundColor: "rgba(94, 114, 228, 0.05)",
                },
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={loading || members?.length === 0}
              onClick={handleSubmit}
              sx={styles.addButton}
            >
              {loading || emailLoading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Add Members"
              )}
            </Button>
          </Box>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            },
          }}
        >
          <DialogTitle sx={{ color: "#32325d" }}>Remove Member</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove {formatDisplayName(selectedMember?.name)} from this group?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setConfirmationOpen(false)}
              sx={{
                color: "#5e72e4",
                "&:hover": {
                  backgroundColor: "rgba(94, 114, 228, 0.05)",
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="contained"
              sx={{
                bgcolor: "#f5365c",
                color: "white",
                "&:hover": {
                  bgcolor: "#f5365c",
                },
              }}
            >
              Remove
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default AddMemberModal;
