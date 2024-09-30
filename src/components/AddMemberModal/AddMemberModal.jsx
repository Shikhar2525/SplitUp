import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import GroupService from "../services/group.service";
import userService from "../services/user.service";
import { useAllGroups } from "../contexts/AllGroups";
import { useLinearProgress } from "../contexts/LinearProgress";

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
  const [emailLoading, setEmailLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null); // To store selected member for deletion
  const [confirmationOpen, setConfirmationOpen] = useState(false); // To handle confirmation dialog
  const { currentGroupID } = useCurrentGroup(); // Use currentGroup to display its title
  const { setLinearProgress } = useLinearProgress();
  const { refreshAllGroups } = useAllGroups();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailAdd = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!validateEmail(inputEmail)) {
        setError("Email is invalid.");
      } else if (members.some((member) => member.email === inputEmail)) {
        setError("This email is already added.");
      } else {
        setEmailLoading(true);

        try {
          const user = await userService.getUserByEmail(inputEmail);
          if (user) {
            // Add avatar along with email
            setMembers((prevMembers) => [...prevMembers, user]);
            setError("");
          } else {
            setMembers((prevMembers) => [
              ...prevMembers,
              user, // No avatar if user not found
            ]);
            setError("User not found, but email added.");
          }
        } catch (err) {
          setError("Error fetching user.");
        } finally {
          setEmailLoading(false);
        }
      }

      setInputEmail(""); // Reset the input field
    }
  };

  const handleChipDelete = (member) => {
    // Directly remove the member from the local state
    setMembers((prevMembers) =>
      prevMembers.filter((m) => m.email !== member.email)
    );
  };

  const handleDeleteClick = (member) => {
    setSelectedMember(member); // Store the selected member for confirmation
    setConfirmationOpen(true); // Open the confirmation dialog
  };

  const handleConfirmDelete = async () => {
    try {
      setLinearProgress(true);
      await GroupService.removeMemberFromGroup(
        currentGroupID,
        selectedMember.email
      ); // Call API to remove member
      refreshAllGroups(); // Refresh groups after deletion
      setError(""); // Clear any errors
    } catch (err) {
      setError("Failed to delete member. Please try again.");
    } finally {
      setConfirmationOpen(false); // Close the confirmation dialog
      setSelectedMember(null); // Clear the selected member
      setLinearProgress(false);
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
      }
      setMembers([]); // Reset members after submission
      refreshAllGroups(); // Refresh the group members
    } catch (error) {
      setError("Failed to add member(s). Please try again.");
    } finally {
      setLoading(false);
      setError("");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
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
              const nameOrEmail = member?.firstName
                ? member?.firstName + " " + member?.lastName
                : member?.email;
              return (
                <Box
                  key={nameOrEmail}
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
                      src={member.profilePicture}
                    >
                      {nameOrEmail.charAt(0)}
                    </Avatar>
                    {/* Tooltip for the email */}
                    <Tooltip title={nameOrEmail} arrow>
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
                        {nameOrEmail}
                      </Typography>
                    </Tooltip>
                  </Box>
                  {/* Delete icon button */}
                  <IconButton
                    sx={{
                      marginLeft: { xs: 0, sm: 2 },
                      marginTop: { xs: 1, sm: 0 },
                    }}
                    onClick={() => handleDeleteClick(member)} // Open confirmation before deletion
                  >
                    <DeleteIcon sx={{ color: "grey", width: 20, height: 20 }} />
                  </IconButton>
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
          <TextField
            fullWidth
            label="Add Members"
            variant="outlined"
            value={inputEmail}
            onChange={(e) => setInputEmail(e.target.value)}
            onKeyDown={handleEmailAdd}
            helperText="Press 'Enter' to add a member"
          />
          <div style={{ marginTop: "0.8rem", marginBottom: "0.8rem" }}>
            {members.map((member, index) => (
              <Chip
                key={index} // Using index as key since member object can change
                label={member.email}
                avatar={
                  <Avatar alt={member.email} src={member.profilePicture}>
                    {member.email.charAt(0)}
                  </Avatar>
                }
                onDelete={() => handleChipDelete(member)} // Directly remove the chip
                sx={{ marginRight: 1, marginTop: 1 }}
              />
            ))}
          </div>
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
