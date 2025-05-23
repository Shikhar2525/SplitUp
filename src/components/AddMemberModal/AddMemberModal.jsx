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
    width: "90%",
    maxWidth: 400,
    bgcolor: "#FFF",
    borderRadius: "16px",
    boxShadow: 24,
    p: 4,
  },
  button: {
    backgroundColor: "#8675FF",
    color: "#FFF",
    "&:hover": {
      backgroundColor: "#FD7289",
    },
  },
  searchingMessage: {
    marginTop: "0.5rem",
    color: "#FFBB38",
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
    } else {
      try {
        setLinearProgress(true);
        await GroupService.removeMemberFromGroup(
          currentGroupID,
          selectedMember?.email
        ); // Call API to remove member

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

        refreshAllGroups(); // Refresh groups after deletion
        setError(""); // Clear any errors
      } catch (err) {
        setError("Failed to delete member. Please try again.");
      } finally {
        setConfirmationOpen(false); // Close the confirmation dialog
        setSelectedMember(null); // Clear the selected member
        setLinearProgress(false);
      }
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

      setMembers([]); // Reset members after submission
      refreshAllGroups(); // Refresh the group members
      setError("");
    } catch (error) {
      setError("Failed to add member(s). Please try again.");
    } finally {
      setLoading(false);
      setError("");
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
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Members
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
        {existingMembers?.length > 0 ? (
          <Box
            sx={{
              padding: 1,
              backgroundColor: "#fff",
              maxHeight: "40vh", // Set a fixed height
              marginBottom: 2,
              overflowY: "auto", // Prevent vertical scroll
              whiteSpace: "nowrap", // Prevent text from wrapping
            }}
          >
            {existingMembers?.map((member) => {
              return (
                <Box
                  key={member?.name}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center", // Align items vertically center
                    borderRadius: "8px",
                    boxShadow: 2,
                    padding: { lg: 0.5, xs: 1, sm: 2 }, // Responsive padding
                    marginTop: 1,
                    marginRight: 1,
                    backgroundColor: "#fff",
                  }}
                >
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
              );
            })}
          </Box>
        ) : (
          <Typography
            variant="subtitle2"
            color="textSecondary"
            gutterBottom
            sx={{ marginBottom: 2 }}
          >
            No members, add new
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}
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
            />
            {suggestions.length > 0 && inputEmail && (
              <Box
                sx={{
                  position: "absolute",
                  width: "100%",
                  maxHeight: "200px",
                  overflowY: "auto",
                  backgroundColor: "white",
                  borderRadius: "0 0 8px 8px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  zIndex: 1000,
                }}
              >
                {suggestions.map((friend) => (
                  <Box
                    key={friend.email}
                    sx={{
                      padding: "8px 16px",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(94, 114, 228, 0.05)",
                      },
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
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
          {showNameField && (
            <TextField
              fullWidth
              sx={{ marginTop: 2 }}
              label="Enter Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleName}
              helperText="Press 'Enter' to add name"
            />
          )}

          <div style={{ marginTop: "0.8rem", marginBottom: "0.8rem" }}>
            {members?.map((member, index) => (
              <Chip
                key={index} // Using index as key since member object can change
                label={member?.name}
                avatar={
                  <Avatar alt={member?.email} src={member?.profilePicture}>
                    {member?.email.charAt(0)}
                  </Avatar>
                }
                onDelete={() => handleChipDelete(member)} // Directly remove the chip
                sx={{ marginRight: 1, marginTop: 1 }}
              />
            ))}
          </div>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {" "}
            <Link
              onClick={resetAddMembers}
              variant="body2"
              sx={{ marginLeft: 0.7 }}
            >
              Reset
            </Link>
            <Button
              variant="contained"
              type="submit"
              sx={styles.button}
              disabled={loading || members?.length === 0}
            >
              {loading || emailLoading ? (
                <CircularProgress size={24} />
              ) : (
                "Add Members"
              )}
            </Button>
          </Box>

          {currentUser?.email !== currentGroupObj?.admin?.email && (
            <Box
              sx={{
                display: "flex",
                justfyContent: "center",
                alignItems: "center",
                marginTop: 2,
                gap: 1,
                color: "#FF1010",
              }}
            >
              <HelpOutlineIcon fontSize="smaller" />
              <Typography variant="subtitle2" fontSize={10}>
                Only admin can add/remove members
              </Typography>
            </Box>
          )}
        </form>

        {/* Confirmation dialog for deletion of existing members */}
        <Dialog
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this member?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmationOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Modal>
  );
};

export default AddMemberModal;
