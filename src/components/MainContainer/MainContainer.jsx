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
        border: "1px solid white",
        backgroundColor: "#BACCFD",
        boxShadow: "5px 5px 15px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Navigation />
      <DashBoard />
    </Box>
  );
}

export default MainContainer;
