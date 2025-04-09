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
import React, { useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [currency, setCurrency] = useState(defaultCurrency);
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

  const handleSubmitNameChange = async () => {
    try {
      setCircularLoader(true);
      await GroupService.updateGroupName(groupID, newGroupName);
      setIsEditing(false);
      setSnackBar({ isOpen: true, message: "Group name changed" });
      refreshAllGroups();
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

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    console.log(`Currency changed to: ${e.target.value}`);
  };

  const handleSaveCurrency = async () => {
    try {
      setCircularLoader(true);
      await GroupService.updateDefaultCurrency(groupID, currency);
      setSnackBar({ isOpen: true, message: "Currency updated successfully!" });
      refreshAllGroups();
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
      refreshAllGroups();
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
    newGroupName.trim() !== "" && newGroupName !== groupName;

  const isCurrencyChanged = currency !== defaultCurrency;

  return (
    <Box
      sx={{
        height: allUserSettled ? (isMobile ? "34vh" : "45vh") : (isMobile ? '40vh' :"55vh"),
        overflow: "auto",
        padding: { xs: 1.5, sm: 2 },
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
                {newGroupName}
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
