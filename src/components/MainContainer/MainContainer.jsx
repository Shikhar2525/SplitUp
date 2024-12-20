import React, { useEffect } from "react";
import {
  Backdrop,
  Box,
  CircularProgress,
  LinearProgress,
  Snackbar,
  useMediaQuery,
} from "@mui/material";
import Navigation from "../Navigation/Navigation";
import { useScreenSize } from "../contexts/ScreenSizeContext"; // Ensure this is correct
import DashBoard from "../Content/Content";
import { useAuth0 } from "@auth0/auth0-react";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useLinearProgress } from "../contexts/LinearProgress";
import { useCircularLoader } from "../contexts/CircularLoader";

function MainContainer() {
  const isMobile = useScreenSize();
  const isNineHundredPixels = useMediaQuery("(max-width:900px)");
  const { isAuthenticated, isLoading } = useAuth0();
  const { snackBar, setSnackBar } = useTopSnackBar();
  const { isLinearProgress } = useLinearProgress();
  const { circularLoader } = useCircularLoader();

  useEffect(() => {
    if (snackBar?.isOpen) {
      const timer = setTimeout(() => {
        setSnackBar({ ...snackBar, isOpen: false });
      }, 3000);
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [snackBar, setSnackBar]);

  return (
    <Box
      sx={{
        height: "100%",
        flex: 1,
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-start",
        justifyContent: "center",
        overflow: isNineHundredPixels ? "auto" : "hidden",
        borderRadius: "30px",
        border: "2px solid white",
        backgroundColor: "#f8f4f4",
        boxShadow: "0 4px 20px rgba(255, 255, 255, 0.7)",
        position: "relative",
      }}
    >
      {(isLoading || isLinearProgress) && (
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
        onClose={() => setSnackBar({ ...snackBar, isOpen: false })}
        message={snackBar?.message}
        ContentProps={{
          sx: {
            backgroundColor:
              snackBar?.type === "success"
                ? "#16DBCC"
                : snackBar?.type === "error"
                ? "#FD7289"
                : "#FF9A3E",
            color: "#FFF", // Text color
          },
        }}
      />

      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={circularLoader}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}

export default MainContainer;
