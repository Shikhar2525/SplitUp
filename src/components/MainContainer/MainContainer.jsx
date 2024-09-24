import React from "react";
import { Box } from "@mui/material";
import Navigation from "../Navigation/Navigation";
import { useScreenSize } from "../contexts/ScreenSizeContext";

function MainContainer() {
  const isMobile = useScreenSize();

  return (
    <Box
      sx={{
        flex: 1, // Makes Box grow to fill remaining height
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "auto", // Prevents content overflow with scrolling
        backgroundColor: "#BACCFD",
        borderRadius: "30px",
        border: "1px solid ligtgrey",
      }}
    >
      <Navigation />
    </Box>
  );
}

export default MainContainer;
