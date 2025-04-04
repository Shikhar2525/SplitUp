import { Box, Button, Typography } from "@mui/material";
import React, { useCallback, useState, useEffect } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useCurrentTab } from "../contexts/CurrentTabContext";
import AccountMenu from "../AccountMenu/AccountMenu";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import { useAllGroups } from "../contexts/AllGroups";
import { useNavigate } from "react-router-dom";
import AddGroupModal from "../AddGroup/AddGroupModal";
import AddIcon from "@mui/icons-material/Add";
import Notifications from "../Notifications/Notifications";
import ActivityService from "../services/activity.service";
import { useCurrentUser } from "../contexts/CurrentUser";

function BreadCrumbs() {
  const isMobile = useScreenSize();
  const { currentGroupID } = useCurrentGroup();
  const { currentTab } = useCurrentTab();
  const [modelOpen, setModelOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loader, setLoader] = useState(false);
  const { currentUser } = useCurrentUser();

  const { allGroups, refreshAllGroups } = useAllGroups();
  const navigate = useNavigate();

  const title = allGroups?.find((group) => group.id === currentGroupID)?.title;

  const toggleModal = useCallback(() => setModelOpen((prev) => !prev), []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoader(true);
      try {
        const fetchedLogs = await ActivityService.fetchActivitiesByEmail(currentUser?.email);
        setLogs(fetchedLogs || []);
      } catch (error) {
        console.error("Error fetching logs:", error);
        setLogs([]);
      } finally {
        setLoader(false);
      }
    };

    if (currentUser?.email) {
      fetchLogs();
    }
  }, [currentUser?.email]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        ...(isMobile ? { maxHeight: "30px" } : {}),
      }}
    >
      <Box
        className="leftSideButton"
        onClick={() => navigate("/")}
        sx={{
          flex: 1,
          display: "flex",
          overflow: "auto",
          flexBasis: "20%",
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 1,
          ...(isMobile && { flexBasis: "14%" }),
          cursor: "pointer",
        }}
      >
        {(currentTab === "Groups" || currentTab === "Friends") && (
          <KeyboardBackspaceIcon sx={{ color: "#3C3F88" }} />
        )}
        <Typography
          sx={{
            fontSize: "20px",
            color: "#3C3F88",
            letterSpacing: "0.05em",
            ...(currentTab === "Groups" ? {} : { marginLeft: 0.6 }),
            ...(isMobile ? { fontSize: 14 } : {}),
          }}
          variant="h6"
          color="initial"
        >
          {currentTab === "Groups"
            ? title
              ? `Group / ${title}`
              : "Group"
            : currentTab}
        </Typography>
      </Box>
      <Box
        className="rightSideButton"
        sx={{
          flex: 1,
          display: "flex",
          flexBasis: "35%",
          flexShrink: 0,
          overflow: "hidden",
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.5,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={toggleModal}
          sx={{
            backgroundColor: "#8675FF",
            color: "#FFF",
            "&:hover": { backgroundColor: "#FD7289" },
            borderRadius: "8px",
            p: "2px 8px",
            display: "flex",
            alignItems: "center",

            ...(isMobile && { minWidth: "38px" }),
          }}
        >
          <AddIcon />
          New Group
        </Button>
        <Notifications logs={logs} loader={loader} />
        <AccountMenu />
      </Box>

      <AddGroupModal
        open={modelOpen}
        handleClose={toggleModal}
        refreshGroups={() => refreshAllGroups()}
      />
      {/* Render notifications box */}
    </Box>
  );
}

export default BreadCrumbs;
