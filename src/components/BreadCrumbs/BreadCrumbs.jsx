import { Box, Typography } from "@mui/material";
import React from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useCurrentTab } from "../contexts/CurrentTabContext";

function BreadCrumbs() {
  const isMobile = useScreenSize();
  const { currentTab } = useCurrentTab();
  const iconStyles = {
    color: "#3C3F88",
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        overflow: "auto",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        ...(isMobile ? { alignItems: "flex-start", maxHeight: "30px" } : {}),
      }}
    >
      <Box
        className="leftSideButton"
        sx={{
          flex: 1,
          display: "flex",
          overflow: "auto",
          flexBasis: "25%",
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 2,
        }}
      >
        <KeyboardBackspaceIcon sx={{ color: "#3C3F88" }} />
        <Typography
          sx={{
            fontSize: "20px",
            color: "#3C3F88",
            letterSpacing: "0.05em",
          }}
          variant="h6"
          color="initial"
        >
          {currentTab}
        </Typography>
      </Box>
      <Box
        className="rightSideButton"
        sx={{
          flex: 1,
          display: "flex",
          flexBasis: "25%",
          flexShrink: 0,
          overflow: "auto",
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <SearchIcon sx={{ ...iconStyles }} />
        <SettingsIcon sx={{ ...iconStyles }} />
        <NotificationsIcon sx={{ ...iconStyles }} />
        <AccountCircleIcon sx={{ ...iconStyles }} />
      </Box>
    </Box>
  );
}

export default BreadCrumbs;
