import React, { useState } from "react";
import { Box, Modal, TextField, Typography, Button } from "@mui/material";
import GroupService from "../services/group.service"; // Adjust the import according to your file structure
import { useLinearProgress } from "../contexts/LinearProgress";
import { useAllGroups } from "../contexts/AllGroups";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useCircularLoader } from "../contexts/CircularLoader";
import { v4 as uuidv4 } from "uuid";
import { useCurrentUser } from "../contexts/CurrentUser";
import ActivityService from "../services/activity.service";
import activityService from "../services/activity.service";

const DeleteGroupModal = ({ open, onClose, groupId, groupName }) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const { setLinearProgress } = useLinearProgress();
  const { refreshAllGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();
  const { currentUser } = useCurrentUser();
  const { setCircularLoader } = useCircularLoader();

  const handleDelete = async () => {
    if (inputValue === groupName) {
      try {
        setCircularLoader(true);
        setLinearProgress(true);
        await GroupService.deleteGroup(groupId);

        await activityService.deleteLogsByGroupId(groupId);

        const log = {
          logId: uuidv4(),
          logType: "deleteGroup",
          details: {
            performedBy: { email: currentUser?.email, name: currentUser?.name },
            date: new Date(),
            groupTitle: groupName,
            groupId: groupId,
          },
        };
        await ActivityService.addActivityLog(log);

        onClose(); // Close the modal after deletion
        setSnackBar({ isOpen: true, message: "Group deleted" });

        refreshAllGroups();
      } catch (error) {
        console.error("Failed to delete group:", error);
      } finally {
        setLinearProgress(false);
        setCircularLoader(false);
      }
    } else {
      setError("Group name does not match. Please try again.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 4,
          backgroundColor: "#fff",
          borderRadius: "8px",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: 24,
          width: { xs: "90%", sm: "400px" }, // Responsive width
        }}
      >
        <Typography variant="h6" gutterBottom align="center">
          Confirm Deletion
        </Typography>
        <Typography variant="body1" align="center" sx={{ marginBottom: 2 }}>
          To confirm the deletion of the group "{groupName}", please type the
          group name below:
        </Typography>
        <Typography
          variant="body2"
          color="error"
          align="center"
          sx={{ marginBottom: 3 }}
        >
          This action will permanently delete this group, including all
          transactions associated with it.
        </Typography>
        <TextField
          label="Group Name"
          variant="outlined"
          fullWidth
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (error) setError(""); // Clear error if input changes
          }}
          error={!!error}
          helperText={error}
        />
        <Box
          sx={{
            marginTop: 3,
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={inputValue !== groupName} // Disable until names match
          >
            Delete Group
          </Button>
          <Button variant="outlined" onClick={onClose} sx={{ marginLeft: 1 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteGroupModal;
