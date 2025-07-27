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
import { useCurrentGroup } from "../contexts/CurrentGroup";
import GroupService from "../services/group.service";
import userService from "../services/user.service";
import { useAllGroups } from "../contexts/AllGroups";
import { useLinearProgress } from "../contexts/LinearProgress";
import groupService from "../services/group.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import activityService from "../services/activity.service";
import { v4 as uuidv4 } from "uuid";
import { useFriends } from "../contexts/FriendsContext";

const styles = {
  modalBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "95%",
    maxWidth: 500,
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    bgcolor: "#FFF",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
    p: 0,
  },
  header: {
    p: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(94, 114, 228, 0.1)",
  },
  content: {
    p: 3,
    overflowY: "auto",
    flex: 1,
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(94, 114, 228, 0.2)",
      borderRadius: "10px",
    },
  },
  membersList: {
    maxHeight: "35vh",
    overflowY: "auto",
    mb: 3,
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
    p: 2,
    mb: 1,
    borderRadius: "16px",
    backgroundColor: "rgba(94, 114, 228, 0.02)",
    border: "1px solid rgba(94, 114, 228, 0.08)",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(94, 114, 228, 0.05)",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(94, 114, 228, 0.05)",
    },
  },
  searchInput: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "rgba(255,255,255,0.8)",
      backdropFilter: "blur(10px)",
      transition: "all 0.2s ease",
      "&:hover": {
        backgroundColor: "rgba(255,255,255,0.9)",
        boxShadow: "0 4px 20px rgba(94, 114, 228, 0.1)",
      },
      "&.Mui-focused": {
        backgroundColor: "white",
        boxShadow: "0 4px 20px rgba(94, 114, 228, 0.15)",
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
    p: 2,
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(94, 114, 228, 0.08)",
      transform: "translateX(8px)",
    },
  },
  footer: {
    p: 3,
    borderTop: "1px solid rgba(94, 114, 228, 0.1)",
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
  },
  addButton: {
    bgcolor: "#5e72e4",
    color: "white",
    borderRadius: "12px",
    textTransform: "none",
    px: 3,
    py: 1,
    "&:hover": {
      bgcolor: "#4b5cc4",
    },
    "&.Mui-disabled": {
      bgcolor: "rgba(94, 114, 228, 0.3)",
    },
  },
  chip: {
    m: 0.5,
    borderRadius: "10px",
    backgroundColor: "rgba(94, 114, 228, 0.1)",
    border: "1px solid rgba(94, 114, 228, 0.2)",
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
  const [showNameField, setShowNameField] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // To store selected member for deletion
  const [confirmationOpen, setConfirmationOpen] = useState(false); // To handle confirmation dialog
  const { currentGroupID } = useCurrentGroup(); // Use currentGroup to display its title
  const { setLinearProgress } = useLinearProgress();
  const { refreshAllGroups } = useAllGroups();
  const { allGroups } = useAllGroups();
  const { currentUser } = useCurrentUser();
  const { userFriends, refreshFriends } = useFriends();
  const [suggestions, setSuggestions] = useState([]);
  const currentGroupObj = allGroups.find(
    (group) => group?.id === currentGroupID
  );
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
      setMembers((prevMembers) => [...prevMembers, userObjWithName]);
      setShowNameField(false);
      setInputEmail("");
      setError("");
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
          <Typography variant="h6" sx={{ color: "#32325d", fontWeight: 600 }}>
            Manage Members
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
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
            <Box sx={styles.membersList}>
              {existingMembers?.map((member) => (
                <Box key={member?.email} sx={styles.memberCard}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <Avatar
                      sx={{ width: 25, height: 25, marginRight: 1 }}
                      src={member?.profilePicture}
                    >
                      {member?.name?.charAt(0)}
                    </Avatar>
                    {/* Tooltip for the email */}
                    <Tooltip title={member?.name} arrow>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#353E6C",
                            maxWidth: "150px", // Set a max width for ellipsis to take effect
                            whiteSpace: "nowrap", // Prevents text from wrapping
                            overflow: "hidden", // Hides the overflow
                            textOverflow: "ellipsis", // Shows ellipsis when the text overflows
                          }}
                        >
                          {member?.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          fontSize={10}
                        >
                          {member?.email === currentGroupObj?.admin?.email &&
                            "Admin"}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Box>
                  {/* Delete icon button */}
                  {(currentUser?.email === currentGroupObj?.admin?.email ||
                    currentUser?.email === member?.email) && (
                    <IconButton
                      sx={{
                        marginLeft: { xs: 0, sm: 2 },
                        marginTop: { xs: 1, sm: 0 },
                      }}
                      onClick={() => handleDeleteClick(member)} // Open confirmation before deletion
                    >
                      <DeleteIcon
                        sx={{ color: "grey", width: 20, height: 20 }}
                      />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Add Members Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ position: "relative" }}>
              <TextField
                disabled={
                  currentUser?.email !== currentGroupObj?.admin?.email ||
                  showNameField
                }
                fullWidth
                label="Add Members"
                variant="outlined"
                value={
                  currentUser?.email !== currentGroupObj?.admin?.email
                    ? ""
                    : inputEmail
                }
                onChange={handleEmailChange}
                onKeyDown={handleEmailAdd}
                helperText="Type to search friends or press 'Enter' to add new member"
                sx={styles.searchInput}
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
                      <Avatar
                        src={friend.profilePicture}
                        alt={friend.name}
                        sx={{ width: 32, height: 32 }}
                      >
                        {friend.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {friend.name}
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

            {/* Name Field for New Users */}
            {showNameField && (
              <TextField
                fullWidth
                sx={{ ...styles.searchInput, mt: 2 }}
                label="Enter Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleName}
                helperText="Press 'Enter' to add name"
              />
            )}

            {/* Selected Members Chips */}
            <Box sx={{ mt: 2, mb: 2 }}>
              {members?.map((member, index) => (
                <Chip
                  key={index}
                  label={member?.name}
                  avatar={
                    <Avatar alt={member?.email} src={member?.profilePicture}>
                      {member?.email.charAt(0)}
                    </Avatar>
                  }
                  onDelete={() => handleChipDelete(member)}
                  sx={styles.chip}
                />
              ))}
            </Box>
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
              Are you sure you want to remove {selectedMember?.name} from this group?
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
