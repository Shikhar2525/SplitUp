import React, { useEffect, useState } from "react";
import { Box, LinearProgress, Snackbar, useMediaQuery } from "@mui/material";
import Navigation from "../Navigation/Navigation";
import { useScreenSize } from "../contexts/ScreenSizeContext"; // Ensure this is correct
import DashBoard from "../Content/Content";
import { useAuth0 } from "@auth0/auth0-react";
import { useTopSnackBar } from "../contexts/TopSnackBar";

function MainContainer() {
  const isMobile = useScreenSize();
  const isNineHundredPixels = useMediaQuery("(max-width:900px)");
  const { isAuthenticated, isLoading } = useAuth0();
  const { snackBar, setSnackBar } = useTopSnackBar();

  useEffect(() => {
    setTimeout(() => {
      snackBar && setSnackBar(false);
    }, 3000);
  }, [snackBar]);

  return (
    <Box
      sx={{
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: isNineHundredPixels ? "auto" : "hidden",
        borderRadius: "30px",
        border: "2px solid white",
        backgroundColor: "#f8f4f4",
        boxShadow: "0 4px 20px rgba(255, 255, 255, 0.7)",
        position: "relative",
      }}
    >
      {isLoading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            zIndex: 1000,
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#F44771",
            },
            "& .MuiLinearProgress-root": {
              backgroundColor: "#62FFFF",
            },
          }}
        />
      )}

      {isAuthenticated && <Navigation />}
      <DashBoard />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackBar?.isOpen}
        message={snackBar?.message}
      />
    </Box>
  );
}

export default MainContainer;
