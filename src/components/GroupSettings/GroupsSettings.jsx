import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteGroupModal from "../DeleteGroupModal/DeleteGroupModal";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { currencies } from "../../constants";
import GroupService from "../services/group.service";
import { useAllGroups } from "../contexts/AllGroups";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useCircularLoader } from "../contexts/CircularLoader";
import { useAllUserSettled } from "../contexts/AllUserSettled";


function GroupsSettings({ groupID, groupName, defaultCurrency, group }) {
  const isMobile = useScreenSize();
  const [openModal, setOpenModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupName);
  const [newDescription, setNewDescription] = useState(group?.description || ''); // Add this
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false); // Add this
  const [currency, setCurrency] = useState(defaultCurrency);
  const [liveGroup, setLiveGroup] = useState(group);
  const [errors, setErrors] = useState({
    description: "",
    groupName: ""
  });

  // Real-time group subscription
  useEffect(() => {
    if (!groupID) return;
    const unsubscribe = GroupService.subscribeToGroupById(groupID, (data) => {
      if (data) {
        setLiveGroup(data);
        setNewGroupName(data.title || "");
        setNewDescription(data.description || "");
        setCurrency(data.defaultCurrency || "");
      }
    });
    return () => unsubscribe();
  }, [groupID]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { refreshAllGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();
  const { setCircularLoader } = useCircularLoader();
  const { allUserSettled } = useAllUserSettled();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleNameChange = (event) => {
    setNewGroupName(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    const value = event.target.value;
    if (value.length <= 100) {
      setNewDescription(value);
      const validationError = validateGroupDescription(value);
      if (validationError) {
        setErrors(prev => ({ ...prev, description: validationError }));
      } else {
        setErrors(prev => ({ ...prev, description: "" }));
      }
    }
  };

  const handleSubmitNameChange = async () => {
    try {
      setCircularLoader(true);
      await GroupService.updateGroupName(groupID, newGroupName);
      setIsEditing(false);
      setSnackBar({ isOpen: true, message: "Group name changed" });
      // No need to call refreshAllGroups, real-time subscription handles updates.
    } catch (error) {
      console.error("Error updating group name:", error);
    } finally {
      setCircularLoader(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewGroupName(groupName);
  };

  const handleEditDescClick = () => {
    setIsEditingDesc(true);
  };

  const handleCancelDescEdit = () => {
    setIsEditingDesc(false);
    setNewDescription(liveGroup?.description || '');
  };

  const handleSubmitDescChange = async () => {
    try {
      setCircularLoader(true);
      await GroupService.updateGroupDescription(groupID, newDescription);
      setIsEditingDesc(false);
      setSnackBar({ isOpen: true, message: "Group description updated" });
    } catch (error) {
      console.error("Error updating group description:", error);
    } finally {
      setCircularLoader(false);
    }
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    console.log(`Currency changed to: ${e.target.value}`);
  };

  const handleSaveCurrency = async () => {
    try {
      setCircularLoader(true);
      await GroupService.updateDefaultCurrency(groupID, currency);
      setSnackBar({ isOpen: true, message: "Currency updated successfully!" });
      // No need to call refreshAllGroups, real-time subscription handles updates.
    } catch (error) {
      console.error("Error updating currency:", error);
      setSnackBar({ isOpen: true, message: "Failed to update currency." });
    } finally {
      setCircularLoader(false);
    }
  };

  const handleDelete = async () => {
    try {
      setCircularLoader(true);
      await GroupService.deleteGroup(groupID);
      setSnackBar({ isOpen: true, message: "Group deleted successfully" });
      // No need to call refreshAllGroups, real-time subscription handles updates.
    } catch (error) {
      setSnackBar({
        isOpen: true,
        message: "Failed to delete group",
        severity: "error",
      });
    } finally {
      setCircularLoader(false);
      setDeleteDialogOpen(false);
    }
  };

  const isGroupNameChanged =
    newGroupName.trim() !== "" && newGroupName !== (liveGroup?.name || groupName);

  const isCurrencyChanged = currency !== (liveGroup?.defaultCurrency || defaultCurrency);

  // Add description validation
  const isDescriptionValid = newDescription.length <= 100 && 
                           !/\s{3,}/.test(newDescription) && 
                           !/([A-Za-z0-9])\1{4,}/.test(newDescription) &&
                           (newDescription.match(/http/g) || []).length <= 1;

  const isDescriptionChanged = newDescription !== (liveGroup?.description || '') && isDescriptionValid;

  // Add validateGroupDescription function
  const validateGroupDescription = (description) => {
    if (description.length > 100) {
      return "Description must not exceed 100 characters";
    }

    // Check for excessive whitespace
    if (/\s{3,}/.test(description)) {
      return "Description contains excessive spaces";
    }

    // Check for common spam patterns
    if (/([A-Za-z0-9])\1{4,}/.test(description)) {
      return "Description contains repetitive characters";
    }

    // Check for URL spam
    if ((description.match(/http/g) || []).length > 1) {
      return "Description contains too many links";
    }

    return "";
  };

  return (
    <Box
      sx={{
        height: '100%', // Changed from fixed height to 100%
        overflow: 'auto',
        padding: { xs: 1.5, sm: 2 },
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(94, 114, 228, 0.2)",
          borderRadius: "4px",
        },
        "& .MuiPaper-root": {
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 20px rgba(94, 114, 228, 0.15)",
          },
        },
      }}
    >
      {/* Group Name Settings Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: "12px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.8)",
          mb: 1.5,
        }}
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          {isEditing ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Rename Group"
                value={newGroupName}
                onChange={handleNameChange}
                variant="outlined"
                inputProps={{ maxLength: 25 }}
                helperText={`${25 - newGroupName.length} characters remaining`}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "12px",
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmitNameChange}
                  disabled={!isGroupNameChanged}
                  startIcon={<SaveIcon />}
                  sx={{
                    bgcolor: "#2dce89",
                    "&:hover": { bgcolor: "#26af74" },
                    borderRadius: "10px",
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelEdit}
                  color="error"
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: "10px" }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: "#32325d", fontWeight: 600 }}
              >
                {groupName}
              </Typography>
              <Button
                variant="outlined"
                onClick={handleEditClick}
                startIcon={<EditIcon />}
                size="small"
                sx={{
                  color: "#5e72e4",
                  borderColor: "#5e72e4",
                  borderRadius: "8px",
                  "&:hover": {
                    borderColor: "#4b5cc4",
                    backgroundColor: "rgba(94, 114, 228, 0.05)",
                  },
                }}
              >
                Edit Name
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Description Settings Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: "12px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.8)",
          mb: 1.5,
        }}
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          {isEditingDesc ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Edit Description"
                value={newDescription}
                onChange={handleDescriptionChange}
                variant="outlined"
                multiline
                rows={3}
                inputProps={{ maxLength: 100 }}
                helperText={
                  errors.description || 
                  `${100 - newDescription.length} characters remaining`
                }
                error={!!errors.description}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    borderRadius: "12px",
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSubmitDescChange}
                  disabled={!isDescriptionChanged}
                  startIcon={<SaveIcon />}
                  sx={{
                    bgcolor: "#2dce89",
                    "&:hover": { bgcolor: "#26af74" },
                    borderRadius: "10px",
                  }}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancelDescEdit}
                  color="error"
                  startIcon={<CancelIcon />}
                  sx={{ borderRadius: "10px" }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "flex-start",
                mb: 1
              }}>
                <Typography variant="subtitle1" sx={{ color: "#32325d", fontWeight: 600,mr: 1.5 }}>
                  Group Description
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleEditDescClick}
                  startIcon={<EditIcon />}
                  size="small"
                  sx={{
                    color: "#5e72e4",
                    borderColor: "#5e72e4",
                    borderRadius: "8px",
                    "&:hover": {
                      borderColor: "#4b5cc4",
                      backgroundColor: "rgba(94, 114, 228, 0.05)",
                    },
                  }}
                >
                  Edit Description
                </Button>
              </Box>
              <Typography variant="body2" sx={{ color: "#525f7f" }}>
                {liveGroup?.description || "No description added"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Currency Settings Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: "12px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.8)",
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ mb: 1.5, color: "#32325d", fontWeight: 600 }}
        >
          Default Currency
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Select
            value={currency}
            onChange={handleCurrencyChange}
            size="small"
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <img
                  src={option.flag}
                  alt={`${option.value} flag`}
                  width="20"
                  height="15"
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <Button
            variant="contained"
            onClick={handleSaveCurrency}
            disabled={!isCurrencyChanged}
            size="small"
            sx={{
              bgcolor: "#2dce89",
              "&:hover": { bgcolor: "#26af74" },
              borderRadius: "8px",
              minWidth: { xs: "100%", sm: "100px" },
            }}
          >
            Save
          </Button>
        </Box>
      </Paper>

      {/* Delete Group Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: "12px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(245, 54, 92, 0.2)",
          borderColor: "rgba(245, 54, 92, 0.2)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ mb: 1, color: "#f5365c", fontWeight: 600 }}
        >
          Danger Zone
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: "block", mb: 1.5, color: "#8898aa" }}
        >
          Once deleted, this group cannot be recovered.
        </Typography>
        <Button
          variant="contained"
          onClick={handleOpenModal}
          startIcon={<DeleteForeverIcon />}
          size="small"
          sx={{
            bgcolor: "#f5365c",
            "&:hover": { bgcolor: "#f5365c", opacity: 0.9 },
            borderRadius: "8px",
            textTransform: "none",
          }}
        >
          Delete Group
        </Button>
      </Paper>

      <DeleteGroupModal
        open={openModal}
        onClose={handleCloseModal}
        groupId={groupID}
        groupName={groupName}
      />
    </Box>
  );
}

export default GroupsSettings;
