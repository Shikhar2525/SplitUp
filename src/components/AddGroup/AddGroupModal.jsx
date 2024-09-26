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

const AddGroupModal = ({ open, handleClose }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [category, setCategory] = useState(""); // New state for category
  const [emails, setEmails] = useState([]);
  const [inputEmail, setInputEmail] = useState("");
  const [error, setError] = useState("");

  const handleEmailAdd = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Check if the email is valid
      if (!validateEmail(inputEmail)) {
        setError("Email is wrong");
      } else if (emails.includes(inputEmail)) {
        // Check if the email is already added
        setError("This email is already added.");
      } else {
        // If valid and not already in the list, add the email
        setEmails((prevEmails) => [...prevEmails, inputEmail]);
        setError(""); // Clear any previous error
      }

      // Clear the input after either adding or showing the error
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      groupName,
      groupDescription,
      category,
      emails,
    });
    // Add your group creation logic here
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
            required
          />

          <TextField
            fullWidth
            sx={styles.formControl}
            label="Group Description"
            variant="outlined"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            required
          />

          {/* Category dropdown */}
          <FormControl fullWidth sx={styles.formControl}>
            <InputLabel id="category-label" shrink={!!category}>
              {" "}
              {/* Use shrink prop */}
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

          {/* Multi-select email input with chips */}
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
          >
            Create Group
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddGroupModal;
