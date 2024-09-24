import { Box } from "@mui/material";
import React from "react";
import BreadCrumbs from "../BreadCrumbs/BreadCrumbs";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { Route, Routes } from "react-router-dom";
import HomeTab from "../HomeTab/Home";
import GroupsTab from "../GroupsTab/GroupsTab";

function Content() {
  const isMobile = useScreenSize();
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        overflow: "auto",
        flexBasis: "75%", // Fixed width for Navigation to 25%
        flexShrink: 0, // Prevents it from shrinking
        padding: 3,
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        backgroundColor: "#BACCFD",
        ...(isMobile ? { width: "100%" } : {}),
      }}
    >
      <BreadCrumbs />
      <Routes>
        <Route index element={<HomeTab />} />
        <Route path="groups" element={<GroupsTab />} />
      </Routes>
    </Box>
  );
}

export default Content;
