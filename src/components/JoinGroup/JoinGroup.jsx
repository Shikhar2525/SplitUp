import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Box, Typography } from "@mui/material";
import GroupService from "../services/group.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useAllGroups } from "../contexts/AllGroups";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useCircularLoader } from "../contexts/CircularLoader";
import userService from "../services/user.service";
import { useCurrentGroup } from "../contexts/CurrentGroup";

const GroupComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve group ID and name from the URL
  const joinGroupId = new URLSearchParams(location.search).get("joinGroupId");
  const groupName = new URLSearchParams(location.search).get("groupName");

  // Context hooks for refreshing groups and snackbar notifications
  const { refreshAllGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();
  const { setCircularLoader } = useCircularLoader();
  const { setCurrentGroupID } = useCurrentGroup();

  // Check if the user is already in the group when component mounts
  useEffect(() => {
    const checkUserInGroup = async () => {
      if (joinGroupId && currentUser) {
        try {
          // Fetch group data by group ID
          const group = await GroupService.getUserFromGroup(
            joinGroupId,
            currentUser.email
          );

          if (group) {
            // User is already in the group, navigate away
            localStorage.setItem("currentGroupID", JSON.stringify(joinGroupId));
            navigate(`/groups`, { replace: true });
          } else {
            // User is not in the group, open the join modal
            const user = await userService.getUserByEmail(currentUser.email);
            if (user?.hasEnteredName) setIsModalOpen(true);
          }
        } catch (error) {
          console.error("Error checking if user is in group: ", error);
        }
      }
    };

    checkUserInGroup();
  }, [joinGroupId, currentUser, navigate]);

  // Handle the user joining the group
  const handleJoinGroup = async () => {
    try {
      setCircularLoader(true);
      await GroupService.addMemberToGroup(joinGroupId, currentUser);

      // Set as current group and store in localStorage
      setCurrentGroupID(joinGroupId);
      localStorage.setItem("currentGroupID", JSON.stringify(joinGroupId));

      // Close modal and update UI
      setIsModalOpen(false);
      await refreshAllGroups(); // Refresh groups first

      // Show success message
      setSnackBar({
        isOpen: true,
        message: "Successfully joined the group!",
      });

      // Navigate to groups page after successful join
      navigate("/groups");
    } catch (error) {
      console.error("Error joining group:", error);
      setSnackBar({
        isOpen: true,
        message: "Failed to join group. Please try again.",
        severity: "error",
      });
    } finally {
      setCircularLoader(false);
    }
  };

  // Handle closing the modal and navigating to home
  const handleCancelJoin = () => {
    navigate("/"); // Navigate to home instead of /groups
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Main group content goes here */}

      {/* Modal to confirm joining the group */}
      <Modal open={isModalOpen} onClose={handleCancelJoin} disableBackdropClick>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "8px",
            textAlign: "center",
            width: { xs: "90%", sm: "400px" }, // Responsive width

            margin: "auto", // Center the modal
            marginTop: "100px", // Adjust top margin for better visibility
          }}
        >
          <Typography variant="h6">Join Group</Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            Would you like to join{" "}
            <strong>{groupName ? groupName : "this group"}</strong>?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: 2,
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={handleJoinGroup}
            >
              Join Group
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancelJoin}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default GroupComponent;
