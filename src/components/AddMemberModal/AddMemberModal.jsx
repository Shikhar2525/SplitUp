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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import GroupService from "../services/group.service";
import userService from "../services/user.service";
import { useAllGroups } from "../contexts/AllGroups";

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

const AddMemberModal = ({ open, handleClose }) => {
  const [inputEmail, setInputEmail] = useState("");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const { currentGroup } = useCurrentGroup();
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
            setMembers((prevMembers) => [...prevMembers, user]);
            setError("");
          } else {
            setMembers((prevMembers) => [
              ...prevMembers,
              { email: inputEmail },
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

  const handleDeleteMember = (emailToDelete) => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.email !== emailToDelete)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (members.length === 0) {
      setError("Please add at least one member.");
      setLoading(false);
      return; // Prevent submitting if no members are added
    }

    try {
      for (const member of members) {
        await GroupService.addMemberToGroup(currentGroup.id, member);
      }
      setMembers([]); // Reset members after submission
      handleClose();
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
            Add Member
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
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
          <div style={{ marginTop: "0.8rem" }}>
            {members.map((member, index) => (
              <Chip
                key={index} // Using index as key since email might not be unique now
                label={member.email}
                onDelete={() => handleDeleteMember(member.email)}
                sx={{ marginBottom: 1.2 }}
              />
            ))}
          </div>
          {emailLoading && (
            <Typography variant="body2" sx={styles.searchingMessage}>
              Searching user...
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            sx={styles.button}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Add Members"}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddMemberModal;
