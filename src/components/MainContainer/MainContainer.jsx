import React from "react";
import { Box, LinearProgress, useMediaQuery } from "@mui/material";
import Navigation from "../Navigation/Navigation";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import DashBoard from "../Content/Content";
import { useAuth0 } from "@auth0/auth0-react";

function MainContainer() {
  const isMobile = useScreenSize();
  const isNineundredPixel = useMediaQuery("(max-width:900px)");
  const { isAuthenticated, isLoading } = useAuth0();

  return (
    <Box
      sx={{
        height: "100%",
        flex: 1, // Makes Box grow to fill remaining height
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: isNineundredPixel ? "auto" : "hidden", // Prevents content overflow with scrolling
        borderRadius: "30px",
        border: "2px solid white", // Solid white border for strong contrast
        backgroundColor: "#f8f4f4", // Darker color for more aggression
        boxShadow: "0 4px 20px rgba(255, 255, 255, 0.7)", // More prominent shadow
        position: "relative", // Ensure the progress bar is positioned relative to this container
      }}
    >
      {/* Progress Loader */}
      {!isLoading && ( // Show loader when loading
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1000, // Ensure it appears on top
          }}
        />
      )}

      {isAuthenticated && <Navigation />}
      <DashBoard />
    </Box>
  );
}

export default MainContainer;
