import { Avatar, Box, Tooltip, Typography, ButtonBase, Chip } from "@mui/material";
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
  const isMobile = useScreenSize();

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
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: { xs: 1, sm: 2 },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: "#32325d",
            fontWeight: 600,
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Settlement Status
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#8898aa",
            fontSize: { xs: "0.8rem", sm: "0.9rem" },
          }}
        >
          Track and manage settlements for all group members
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden", // Prevent horizontal scroll
          pr: { xs: 0.5, sm: 1 },
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(94, 114, 228, 0.2)",
            borderRadius: "8px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
            maxWidth: "100%", // Ensure content doesn't overflow
          }}
        >
          {members?.map((member) => {
            const isSettled = member?.userSettled;
            const isCurrentUser = currentUser?.email === member?.email;
            const canSettle =
              currentGroup?.admin?.email === currentUser?.email || isCurrentUser;

            return (
              <ButtonBase
                disabled={!canSettle}
                key={member?.email}
                onClick={() =>
                  handleSettleToggle(member?.email, member?.name, isSettled)
                }
                sx={{
                  width: "100%",
                  display: "block",
                  textAlign: "left",
                }}
              >
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: "16px",
                    backgroundColor:
                      isSettled ? "rgba(45, 206, 137, 0.1)" : "white",
                    border: "1px solid",
                    borderColor:
                      isSettled
                        ? "rgba(45, 206, 137, 0.2)"
                        : "rgba(94, 114, 228, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, sm: 1.5 },
                    minWidth: 0, // Allow content to shrink
                    maxWidth: "100%", // Prevent overflow
                  }}
                >
                  <Avatar
                    src={member?.profilePicture}
                    sx={{
                      width: { xs: 35, sm: 40 },
                      height: { xs: 35, sm: 40 },
                      flexShrink: 0,
                    }}
                  >
                    {member?.name?.[0]}
                  </Avatar>

                  <Box
                    sx={{
                      flex: "1 1 auto",
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                        flexWrap: "wrap",
                      }}
                    >
                      <Typography
                        noWrap
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.85rem", sm: "0.9rem" },
                          color: "#32325d",
                          maxWidth: { xs: "120px", sm: "150px" },
                        }}
                      >
                        {member?.name}
                      </Typography>
                      {isCurrentUser && (
                        <Chip
                          label="You"
                          size="small"
                          sx={{
                            height: { xs: 18, sm: 20 },
                            fontSize: { xs: "0.65rem", sm: "0.7rem" },
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.8rem" },
                        color: "#8898aa",
                        maxWidth: { xs: "150px", sm: "200px" },
                      }}
                    >
                      {member?.email}
                    </Typography>
                  </Box>

                  {isSettled && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        backgroundColor: "rgba(45, 206, 137, 0.1)",
                        color: "#2dce89",
                        py: 0.5,
                        px: { xs: 1, sm: 1.5 },
                        borderRadius: "8px",
                        ml: "auto",
                        flexShrink: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.75rem" },
                          fontWeight: 600,
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
    </Box>
  );
};

export default SettleTab;
