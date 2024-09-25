import React from "react";
import { Box } from "@mui/material";
import Navigation from "../Navigation/Navigation";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import DashBoard from "../Content/Content";

function MainContainer() {
  const isMobile = useScreenSize();

  return (
    <Box
      sx={{
        flex: 1, // Makes Box grow to fill remaining height
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "auto", // Prevents content overflow with scrolling
        borderRadius: "30px",
        border: "2px solid white", // Solid white border for strong contrast
        backgroundColor: "#f8f4f4", // Darker color for more aggression
        boxShadow: "0 4px 20px rgba(255, 255, 255, 0.7)", // More prominent shadow
      }}
    >
      <Navigation />
      <DashBoard />
    </Box>
  );
}

export default MainContainer;
