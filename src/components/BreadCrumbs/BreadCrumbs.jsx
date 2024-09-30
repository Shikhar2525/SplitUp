import { Box, Button, Typography } from "@mui/material";
import React, { useState } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useCurrentTab } from "../contexts/CurrentTabContext";
import AddExpenseButton from "../AddExpense/AddExpenseModal";
import AccountMenu from "../AccountMenu/AccountMenu";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import { useAllGroups } from "../contexts/AllGroups";

function BreadCrumbs() {
  const isMobile = useScreenSize();
  const { currentGroupID } = useCurrentGroup();
  const { currentTab } = useCurrentTab();
  const [modelOpen, setModelOpen] = useState(false);
  const { allGroups } = useAllGroups();

  const title = allGroups?.find((group) => group.id === currentGroupID)?.title;

  const handleClose = () => {
    setModelOpen(false);
  };

  const iconStyles = {
    color: "#3C3F88",
  };

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
        }}
      >
        {currentTab === "Groups" && (
          <KeyboardBackspaceIcon sx={{ color: "#3C3F88" }} />
        )}
        <Typography
          sx={{
            fontSize: "20px",

            color: "#3C3F88",
            letterSpacing: "0.05em",
            ...(currentTab === "Groups"
              ? {}
              : {
                  marginLeft: 0.6,
                }),
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
          size="small"
          variant="contained"
          onClick={() => setModelOpen(true)}
          sx={{
            backgroundColor: "#8675FF",
            borderRadius: "20px",
            color: "#FFF",
            "&:hover": { backgroundColor: "#FD7289" },
          }}
        >
          Add {!isMobile && "Expense"}
        </Button>
        <NotificationsIcon sx={{ ...iconStyles }} />
        <AccountMenu />
      </Box>
      <AddExpenseButton open={modelOpen} handleClose={() => handleClose()} />
    </Box>
  );
}

export default BreadCrumbs;
