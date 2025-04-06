import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import React, { useState } from "react";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteGroupModal from "../DeleteGroupModal/DeleteGroupModal";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
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
  const [groupIcon, setGroupIcon] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        setIsUploading(true);
        // TODO: Implement file upload to your storage service
        // const imageUrl = await uploadImage(file);
        // await GroupService.updateGroupIcon(groupID, imageUrl);
        setIsUploading(false);
        setSnackBar({ isOpen: true, message: "Group icon updated successfully" });
        refreshAllGroups();
      } catch (error) {
        console.error("Error uploading image:", error);
        setSnackBar({ isOpen: true, message: "Failed to update group icon" });
        setIsUploading(false);
      }
    }
  };

  const isGroupNameChanged =
    newGroupName.trim() !== "" && newGroupName !== groupName;

  const isCurrencyChanged = currency !== defaultCurrency;

  return (
    <Box
      sx={{
        height: allUserSettled ? "46vh" : "53vh",
        overflow: "auto",
        padding: { xs: 2, sm: 3 },
        "& .MuiCard-root": {
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(94, 114, 228, 0.15)",
          },
        },
      }}
    >
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: 700,
          background: "linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Group Settings
      </Typography>

      <Card
        sx={{
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <CardContent
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 3,
            p: 3,
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={groupIcon}
              sx={{
                width: { xs: 80, sm: 100 },
                height: { xs: 80, sm: 100 },
                fontSize: "2rem",
                bgcolor: "#5e72e4",
                border: "4px solid white",
                boxShadow: "0 4px 20px rgba(94, 114, 228, 0.2)",
              }}
            >
              {groupName?.[0]?.toUpperCase()}
            </Avatar>
            <label htmlFor="icon-upload">
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <IconButton
                component="span"
                sx={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  backgroundColor: "white",
                  boxShadow: "0 2px 12px rgba(94, 114, 228, 0.15)",
                  "&:hover": {
                    backgroundColor: "#f8f9fe",
                  },
                }}
              >
                <PhotoCameraIcon sx={{ color: "#5e72e4" }} />
              </IconButton>
            </label>
          </Box>

          <Box sx={{ flex: 1 }}>
            {isEditing ? (
              <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                <TextField
                  fullWidth
                  label="Group Name"
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
                  <IconButton
                    onClick={handleSubmitNameChange}
                    disabled={!isGroupNameChanged}
                    color="primary"
                    sx={{
                      backgroundColor: "rgba(94, 114, 228, 0.1)",
                      "&:hover": { backgroundColor: "rgba(94, 114, 228, 0.2)" },
                    }}
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    onClick={handleCancelEdit}
                    sx={{
                      color: "#f5365c",
                      backgroundColor: "rgba(245, 54, 92, 0.1)",
                      "&:hover": { backgroundColor: "rgba(245, 54, 92, 0.2)" },
                    }}
                  >
                    <CancelIcon />
                  </IconButton>
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
                <IconButton
                  onClick={handleEditClick}
                  sx={{
                    color: "#5e72e4",
                    backgroundColor: "rgba(94, 114, 228, 0.1)",
                    "&:hover": { backgroundColor: "rgba(94, 114, 228, 0.2)" },
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          mb: 3,
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#32325d", fontWeight: 600 }}
          >
            Currency Settings
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Select
              value={currency}
              onChange={handleCurrencyChange}
              sx={{
                flex: 1,
                maxWidth: 300,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
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
              sx={{
                borderRadius: "12px",
                bgcolor: "#5e72e4",
                "&:hover": { bgcolor: "#4b5cc4" },
                "&.Mui-disabled": { bgcolor: "rgba(94, 114, 228, 0.4)" },
              }}
            >
              Save
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, color: "#32325d", fontWeight: 600 }}
          >
            Danger Zone
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            startIcon={<DeleteForeverIcon />}
            sx={{
              bgcolor: "#f5365c",
              "&:hover": { bgcolor: "#d92550" },
              borderRadius: "12px",
              textTransform: "none",
              px: 3,
            }}
          >
            Delete Group
          </Button>
        </CardContent>
      </Card>

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
