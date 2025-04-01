import React from "react";
import { Box, Typography, Button } from "@mui/material";
import AltRouteIcon from '@mui/icons-material/AltRoute';
import { useAuth0 } from "@auth0/auth0-react";
import { Typewriter } from "react-simple-typewriter";

const WelcomeScreen = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "92vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "1.5rem 2rem",
          zIndex: 2,
        }}
      >
        <AltRouteIcon sx={{ color: "#1976d2", fontSize: 35 }} />
        <Typography
          sx={{
            color: "#2C3E50",
            fontSize: { xs: "1.8rem", md: "2rem" },
            fontWeight: 700,
          }}
        >
          SplitUp
        </Typography>
      </Box>

      {/* Background Wave SVG */}
      <Box
        component="svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        sx={{
          position: "absolute",
          bottom: -5, // Adjust to touch bottom
          left: 0,
          width: "100%",
          height: "35%", // Reduced height
          zIndex: 0,
          transform: "scale(1.1)", // Slightly scale up to ensure coverage
        }}
      >
        <path
          fill="#4A90E2"
          fillOpacity="0.15"
          d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,128C672,107,768,85,864,90.7C960,96,1056,128,1152,133.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </Box>

      {/* Content Container */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          flex: 1,
          flexDirection: { xs: "column", md: "row" },
          position: "relative",
          zIndex: 1,
          marginBottom: "2rem", // Add margin to push content up
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: { xs: "1rem", md: "3rem" }, // Reduced padding
            paddingTop: { xs: "0.5rem", md: "2rem" }, // Reduced top padding
            alignItems: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" },
            justifyContent: "center",
          }}
        >
          {/* Existing Typewriter Title */}
          <Typography
            variant="h2"
            sx={{
              color: "#2C3E50",
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              fontWeight: 700,
              marginBottom: "1.5rem", // Slightly increased bottom margin
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

          <Typography
            variant="h5"
            sx={{
              color: "#7F8C8D",
              marginBottom: "2rem",
              maxWidth: "500px",
              fontSize: { xs: "1.2rem", md: "1.5rem" },
            }}
          >
            Split bills effortlessly with friends and family
          </Typography>

          <Button
            onClick={() => loginWithRedirect()}
            variant="contained"
            sx={{
              backgroundColor: "#4A90E2",
              padding: "12px 32px",
              borderRadius: "30px",
              fontSize: "1.1rem",
              textTransform: "none",
              boxShadow: "0 4px 15px rgba(74, 144, 226, 0.3)",
              "&:hover": {
                backgroundColor: "#357ABD",
                boxShadow: "0 6px 20px rgba(74, 144, 226, 0.4)",
              },
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Right Section - Illustration */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            marginBottom: "3rem", // Add margin to prevent collision with wave
          }}
        >
          <Box
            component="img"
            src="https://cdni.iconscout.com/illustration/premium/thumb/split-payment-3678730-3098608.png"
            alt="Split Payment Illustration"
            sx={{
              maxWidth: "80%",
              maxHeight: "80%",
              objectFit: "contain",
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))", // Soft shadow
              borderRadius: "30px", // Soft edges
              padding: "15px", // Add some space around image
              transition: "all 0.3s ease",
              "&:hover": {
                filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.15))",
                transform: "translateY(-5px)",
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default WelcomeScreen;
