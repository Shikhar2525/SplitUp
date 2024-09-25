import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Typewriter } from "react-simple-typewriter";
import { useAuth0 } from "@auth0/auth0-react";

const WelcomeScreen = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Box
      sx={{
        display: "flex",
        height: "92vh", // Full height of the viewport
        width: "100%", // Full width of the viewport
        flexDirection: "column",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        textAlign: "center",
        backgroundColor: "#353E6C", // Background color
        overflow: "hidden", // Prevent scroll
      }}
    >
      {/* Title with Typewriter Animation */}
      <Typography
        variant="h2"
        component="h1"
        sx={{
          color: "white", // Title color
          fontSize: { xs: "2rem", sm: "3rem", md: "4rem" }, // Responsive font size
          overflow: "hidden", // Prevent overflow
        }}
      >
        <Typewriter
          words={["Welcome to SplitUp"]}
          loop={false}
          cursor
          cursorStyle="_"
          typeSpeed={70}
        />
      </Typography>

      {/* Subtitle */}
      <Typography
        variant="h5"
        component="h2"
        sx={{
          marginTop: "16px",
          color: "#FD7289", // Subtitle color
          fontSize: { xs: "1rem", sm: "1.5rem", md: "2rem" }, // Responsive subtitle font size
          overflow: "hidden", // Prevent overflow
        }}
      >
        Split bills like a pro
      </Typography>

      {/* Login Button */}
      <Button
        onClick={() => loginWithRedirect()}
        variant="contained"
        sx={{
          marginTop: "32px",
          backgroundColor: "#FFBB38", // Updated button color
          color: "#353E6C", // Change text color to dark for contrast
          padding: { xs: "6px 12px", sm: "8px 16px", md: "10px 24px" }, // Reduced padding for a smaller button
          fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" }, // Smaller font size for the button
          borderRadius: 3, // Slightly less rounded corners
          boxShadow: 1, // Add a subtle shadow for depth
          "&:hover": {
            backgroundColor: "#FD7289", // Hover effect color
            boxShadow: 2, // Increase shadow on hover for depth
          },
        }}
      >
        Login
      </Button>
    </Box>
  );
};

export default WelcomeScreen;
