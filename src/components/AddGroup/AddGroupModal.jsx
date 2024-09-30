import React, { useState } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  FormControl,
  Typography,
  IconButton,
  Chip,
  Alert,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { v4 as uuidv4 } from "uuid";
import GroupService from "../services/group.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import CircularProgress from "@mui/material/CircularProgress";
import userService from "../services/user.service";

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
  title: {
    marginBottom: 5,
    color: "#353E6C",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formControl: {
    marginBottom: "1rem", // Same margin for all fields
    width: "100%", // Full width for all fields
  },
};

const AddGroupModal = ({ open, handleClose, refreshGroups }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [category, setCategory] = useState(""); // New state for category
  const [emails, setEmails] = useState([]);
  const [inputEmail, setInputEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading
  const { currentUser } = useCurrentUser();
  const { setSnackBar } = useTopSnackBar();

  const handleEmailAdd = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!validateEmail(inputEmail)) {
        setError("Email is wrong");
      } else if (emails.includes(inputEmail)) {
        setError("This email is already added.");
      } else {
        setEmails((prevEmails) => [...prevEmails, inputEmail]);
        setError("");
      }

      setInputEmail("");
    }
  };

  const handleDeleteEmail = (emailToDelete) => {
    setEmails((prevEmails) =>
      prevEmails.filter((email) => email !== emailToDelete)
    );
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true before API call

    const adminUserObject = await userService.getUserByEmail(
      currentUser?.email
    );

    const newGroup = {
      id: uuidv4(),
      title: groupName,
      description: groupDescription,
      category: category,
      members: emails,
      createdDate: new Date(),
      isAllSettled: false,
      expenses: [],
      admin: adminUserObject,
    };

    try {
      await GroupService.createGroup(newGroup);

      setGroupName("");
      setGroupDescription("");
      setCategory("");
      setEmails([]);
      setInputEmail("");

      handleClose();
      setSnackBar({
        isOpen: true,
        message: "Group created",
      });
      refreshGroups();
    } catch (error) {
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false); // Set loading to false after API call
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={styles.modalBox}>
        <div style={styles.title}>
          <Typography variant="h6" component="h2" gutterBottom>
            Create Group
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            sx={styles.formControl}
            label="Group Name"
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            inputProps={{ maxLength: 25 }}
            required
          />

          <TextField
            fullWidth
            sx={styles.formControl}
            label="Group Description"
            variant="outlined"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            inputProps={{ maxLength: 150 }}
          />

          <FormControl fullWidth sx={styles.formControl}>
            <InputLabel id="category-label" shrink={!!category}>
              Category
            </InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              variant="outlined"
              required
            >
              <MenuItem value="Trip">Trip</MenuItem>
              <MenuItem value="Home">Home</MenuItem>
              <MenuItem value="Couple">Couple</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={styles.formControl}>
            <div>
              {emails.map((email) => (
                <Chip
                  key={email}
                  label={email}
                  onDelete={() => handleDeleteEmail(email)}
                  sx={{ margin: "0.3rem" }}
                />
              ))}
            </div>
            <TextField
              label="Add Members"
              variant="outlined"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              onKeyDown={handleEmailAdd}
              fullWidth
              sx={{ marginTop: "1rem" }}
              helperText="Press 'Enter' to add a member"
            />
            {error && <Alert severity="error">{error}</Alert>}
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            sx={styles.button}
            fullWidth
            disabled={loading} // Disable button when loading
          >
            Create Group
            {loading && (
              <CircularProgress
                color="success"
                size={20}
                sx={{ marginLeft: 2 }}
              />
            )}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddGroupModal;
