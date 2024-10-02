import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

// Styling for the modal box
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const AddNameModal = ({ open, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState("");
  const { logout } = useAuth0();
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
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" gutterBottom>
            What's we will call you?
          </Typography>

          <TextField
            required
            fullWidth
            label="Enter Nickname"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            margin="normal"
            helperText="* Its important for us to have you a name"
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
            onClick={handleLogout} // Close button to manually close the modal
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
