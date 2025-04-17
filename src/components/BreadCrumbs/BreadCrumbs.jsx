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
  if (!currentUser?.email) return;
  setLoader(true);
  const unsubscribe = ActivityService.subscribeToActivitiesByEmail(currentUser.email, (fetchedLogs) => {
    setLogs(fetchedLogs || []);
    setLoader(false);
  });
  return () => unsubscribe();
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
          overflow: "hidden", // Changed from auto to hidden
          flexBasis: { xs: '30%', sm: '20%' }, // Adjusted flex basis
          flexShrink: 0,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 1,
          cursor: "pointer",
        }}
      >
        {(currentTab === "Groups" || currentTab === "Friends") && (
          <KeyboardBackspaceIcon 
            sx={{ 
              color: "#3C3F88",
              flexShrink: 0 // Prevent icon from shrinking
            }} 
          />
        )}
        <Typography
          sx={{
            fontSize: { xs: '14px', sm: '20px' },
            color: "#3C3F88",
            letterSpacing: "0.05em",
            marginLeft: currentTab === "Groups" ? 0 : 0.6,
            whiteSpace: { xs: 'normal', sm: 'nowrap' }, // Allow wrapping on mobile
            wordBreak: 'break-word', // Enable word breaking
            lineHeight: { xs: 1.2, sm: 'normal' }, // Adjust line height for wrapped text
            maxWidth: { xs: '200px', sm: '300px', md: 'none' }, // Control max width
            display: '-webkit-box',
            WebkitLineClamp: { xs: 2, sm: 1 }, // Show 2 lines on mobile, 1 on desktop
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          variant="h6"
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
          display: 'flex',
          flexBasis: { xs: '25%', sm: '35%' },
          flexShrink: 0,
          overflow: 'visible',
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: { xs: 'flex-end', sm: 'flex-end' },
          gap: { xs: 1, sm: 1.5 },
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
            padding: { xs: '6px 8px', sm: '6px 16px' },
            minWidth: { xs: 'auto', sm: '120px' },
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 0, sm: 1 },
            whiteSpace: 'nowrap',
            '& .MuiButton-startIcon': {
              margin: { xs: 0, sm: '-4px 8px -4px 0' }
            }
          }}
          startIcon={<AddIcon sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' } }} />}
        >
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>New Group</Box>
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
