import { Box } from "@mui/material";
import React from "react";
import BreadCrumbs from "../BreadCrumbs/BreadCrumbs";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { Route, Routes } from "react-router-dom";
import HomeTab from "../HomeTab/Home";
import GroupsTab from "../GroupsTab/GroupsTab";
import { useAuth0 } from "@auth0/auth0-react";
import Welcome from "../Welcome/Welcome";

function Content() {
  const isMobile = useScreenSize();
  const { isAuthenticated } = useAuth0();

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        overflow: "auto",
        flexBasis: isMobile ? "90%" : "75%", // Fixed width for Navigation to 25%
        flexShrink: 0, // Prevents it from shrinking
        padding: isMobile ? 1 : isAuthenticated ? 3 : 1,
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        backgroundColor: "#f8f4f4",
        borderRadius: "30px",
        position: "relative", // Set position to relative for absolute children
        ...(isMobile ? { width: "100%" } : {}),
      }}
    >
      {isAuthenticated && <BreadCrumbs />}
      <Routes>
        <Route index element={isAuthenticated ? <HomeTab /> : <Welcome />} />
        <Route
          path="groups"
          element={isAuthenticated ? <GroupsTab /> : <Welcome />}
        />
      </Routes>
    </Box>
  );
}

export default Content;
