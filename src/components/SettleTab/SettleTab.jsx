import { Avatar, Box, Tooltip, Typography, ButtonBase } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import React from "react";
import GroupService from "../services/group.service.js";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useCircularLoader } from "../contexts/CircularLoader.js";
import { useAllGroups } from "../contexts/AllGroups.js";
import { useCurrentUser } from "../contexts/CurrentUser.js";
import { v4 as uuidv4 } from "uuid";
import activityService from "../services/activity.service.js";
import { useAllUserSettled } from "../contexts/AllUserSettled.js";
import { useScreenSize } from "../contexts/ScreenSizeContext.js";

const SettleTab = ({ members, groupID }) => {
  const { setSnackBar } = useTopSnackBar();
  const { setCircularLoader } = useCircularLoader();
  const { refreshAllGroups } = useAllGroups();
  const { allGroups } = useAllGroups();
  const { currentUser } = useCurrentUser();
  const { allUserSettled } = useAllUserSettled();
  const isMobile = useScreenSize()

  const currentGroup = allGroups?.find((item) => item.id === groupID);

  // Toggle settled state for a member
  const handleSettleToggle = async (
    memberEmail,
    memberName,
    isCurrentlySettled
  ) => {
    // Show the circular loader while processing the update
    setCircularLoader(true);

    try {
      // Call the service to update the settled status in Firestore
      await GroupService.updateUserSettledStatus(
        groupID,
        memberEmail,
        !isCurrentlySettled // Send the opposite of the current state
      );

      const log = {
        logId: uuidv4(),
        logType: isCurrentlySettled ? "unSettle" : "settle",
        details: {
          userAffected: { email: memberEmail, name: memberName },
          performedBy: { email: currentUser?.email, name: currentUser?.name },
          date: new Date(),
          groupTitle: currentGroup?.title,
          groupId: groupID,
        },
      };

      await activityService.addActivityLog(log);

      // Show success message in the snackbar
      setSnackBar({
        isOpen: true,
        message: `${memberName} is ${
          isCurrentlySettled ? "unsettled" : "setlled"
        }`,
      });

      // Refresh groups to get the latest settled states
      refreshAllGroups();
    } catch (error) {
      console.error("Error updating member settled status:", error);
      // Optionally show an error snackbar or handle it accordingly
      setSnackBar({
        isOpen: true,
        message: "Error updating settled status. Please try again.",
      });
    } finally {
      // Hide the circular loader regardless of success or failure
      setCircularLoader(false);
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#fff",
        borderRadius: "16px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        marginBottom: 3,
      }}
    >
      <Typography
        variant="subtitle1"
        marginTop={1}
        marginLeft={1}
        sx={{ color: "#353E6C" }}
      >
        Settle up members
      </Typography>
      <Typography
        variant="subtitle2"
        marginLeft={1}
        fontSize="10px"
        color="textSecondary"
      >
        Only admin can settle all members
      </Typography>
      <Box
        sx={{
          padding: 1,
          backgroundColor: "#fff",
          height: allUserSettled ? (isMobile ? "25vh" : "40vh") : (isMobile ? '40vh' :"55vh"),
          marginBottom: 2,
          overflowX: "hidden",
          whiteSpace: "nowrap",
        }}
      >
        {members?.map((member) => {
          const isSettled = member?.userSettled; // Use the property directly from the member

          return (
            <ButtonBase
              disabled={
                currentGroup?.admin?.email !== currentUser?.email &&
                currentUser?.email !== member?.email
              }
              key={member?.email}
              sx={{
                width: "99%",
                borderRadius: "8px",
                marginTop: 1,
                marginRight: 1,
                padding: { lg: 0.8, xs: 1, sm: 2 },
                boxShadow: 2,
                transition: "0.3s",
                display: "block",
                backgroundColor: isSettled ? "#d4edda" : "#fff",
                "&:hover": {
                  backgroundColor: isSettled ? "#c3e6cb" : "#f0f0f0",
                  transform: "scale(1.02)",
                },
              }}
              onClick={() =>
                handleSettleToggle(member?.email, member?.name, isSettled)
              } // Pass current settled state
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Avatar
                    sx={{ width: 25, height: 25, marginRight: 1 }}
                    src={member?.profilePicture}
                  >
                    {member?.name?.charAt(0)}
                  </Avatar>
                  <Tooltip title={member?.name} arrow>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#353E6C",
                          maxWidth: "150px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textDecoration: isSettled ? "line-through" : "none",
                        }}
                      >
                        {member?.name}
                        {currentUser?.email === member?.email && " (You)"}
                      </Typography>
                    </Box>
                  </Tooltip>
                </Box>

                {isSettled && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <CheckCircleIcon
                      sx={{ color: "#28a745", marginRight: 0.5 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#28a745",
                      }}
                    >
                      Settled
                    </Typography>
                  </Box>
                )}
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
};

export default SettleTab;
