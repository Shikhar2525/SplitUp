import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";

const NotificationsBox = ({ open, handleClose }) => {
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        handleClose(); // Close notifications when clicking outside
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClose]);

  if (!open) return null;

  return (
    <Paper
      ref={notificationsRef} // Attach the ref to the Paper component
      elevation={3}
      sx={{
        position: "absolute",
        top: "60px", // Adjust based on your layout
        right: "10px", // Adjust based on your layout
        width: {
          xs: "90%", // 90% width for small screens
          sm: "300px", // 300px width for medium and larger screens
        },
        maxHeight: "400px", // Limit height
        overflowY: "auto", // Scroll if content exceeds
        bgcolor: "#ffffff",
        padding: {
          xs: "8px", // Less padding for small screens
          sm: "10px", // Standard padding for larger screens
        },
        zIndex: 1000, // Ensure it appears above other elements
        borderRadius: "8px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 1, fontWeight: "bold", color: "#3C3F88" }}
      >
        Notifications
      </Typography>
      <Box sx={{ maxHeight: "300px", overflowY: "auto" }}>
        {/* Sample notifications */}
        {Array.from({ length: 5 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              padding: "8px",
              marginBottom: "8px",
              borderRadius: "6px",
              transition: "background-color 0.2s",
              "&:hover": {
                backgroundColor: "#F5F5F5",
              },
            }}
          >
            <Typography variant="body1" sx={{ color: "#333" }}>
              Notification message {index + 1}
            </Typography>
            <Typography variant="caption" sx={{ color: "#999" }}>
              {new Date().toLocaleTimeString()} {/* Display current time */}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default NotificationsBox;
