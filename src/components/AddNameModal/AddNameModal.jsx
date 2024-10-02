import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  useMediaQuery,
} from "@mui/material"; // Import useMediaQuery
import { useAuth0 } from "@auth0/auth0-react";

// Styling for the modal box
const modalStyle = (isSmallScreen) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: isSmallScreen ? "90%" : 400, // Adjust width based on screen size
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
});

const AddNameModal = ({ open, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState("");
  const { logout } = useAuth0();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("sm")); // Check if the screen size is small

  const handleSubmit = () => {
    onSubmit(inputValue); // Send the input value to the parent
    setInputValue(""); // Reset the input field
  };

  const handleLogout = async () => {
    await logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <div>
      <Modal
        open={open}
        onClose={() => {}} // Prevent closing when clicking outside
        disableBackdropClick // Prevent backdrop click from closing the modal
        disableEscapeKeyDown // Prevent escape key from closing the modal
      >
        <Box sx={modalStyle(isSmallScreen)}>
          {" "}
          {/* Pass isSmallScreen to modalStyle */}
          <Typography variant="h6" component="h2" gutterBottom>
            What should we call you?
          </Typography>
          <TextField
            required
            fullWidth
            label="Enter Nickname"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            margin="normal"
            helperText="* It's important for us to have you a name"
          />
          <Button
            disabled={!inputValue}
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            sx={{ mt: 2 }}
          >
            Add name
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout} // Logout button
            fullWidth
            sx={{ mt: 2 }}
          >
            Logout
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default AddNameModal;
