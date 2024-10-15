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
} from "@mui/material";
import React, { useState } from "react";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteGroupModal from "../DeleteGroupModal/DeleteGroupModal";
import CancelIcon from "@mui/icons-material/Cancel";
import { currencies } from "../../constants";
import GroupService from "../services/group.service";
import { useAllGroups } from "../contexts/AllGroups";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useCircularLoader } from "../contexts/CircularLoader";

function GroupsSettings({ groupID, groupName, defaultCurrency, group }) {
  const isMobile = useScreenSize();
  const [openModal, setOpenModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState(groupName);
  const [isEditing, setIsEditing] = useState(false);
  const [currency, setCurrency] = useState(defaultCurrency);
  const { refreshAllGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();
  const { setCircularLoader } = useCircularLoader();

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

  // Method to save the selected currency
  const handleSaveCurrency = async () => {
    try {
      setCircularLoader(true);
      await GroupService.updateDefaultCurrency(groupID, currency); // Call the service to update the currency
      setSnackBar({ isOpen: true, message: "Currency updated successfully!" });
      refreshAllGroups();
    } catch (error) {
      console.error("Error updating currency:", error);
      setSnackBar({ isOpen: true, message: "Failed to update currency." });
    } finally {
      setCircularLoader(false);
    }
  };

  // Check if group name is valid for enabling the save button
  const isGroupNameChanged =
    newGroupName.trim() !== "" && newGroupName !== groupName;

  // Check if currency is changed for enabling the save button
  const isCurrencyChanged = currency !== defaultCurrency;

  return (
    <Box
      sx={{
        height: "53vh",
        overflow: "auto",
        padding: isMobile ? 1 : 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: "bold", color: "#353E6C" }}>
        Group Settings
      </Typography>

      <Table>
        <TableBody>
          <TableRow>
            <TableCell>
              <Typography variant="body1" sx={{ color: "#353E6C" }}>
                Group Name:
              </Typography>
            </TableCell>
            <TableCell>
              {isEditing ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <TextField
                    label="Rename Group"
                    value={newGroupName}
                    onChange={handleNameChange}
                    variant="outlined"
                    inputProps={{ maxLength: 25 }}
                    helperText={`${
                      25 - newGroupName.length
                    } characters remaining`}
                    sx={{ backgroundColor: "#f0f0f0", borderRadius: 2 }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmitNameChange}
                    disabled={!isGroupNameChanged} // Disable if name is not changed or empty
                    sx={{
                      backgroundColor: "#007AFF",
                      color: "#FFF",
                      borderRadius: "8px",
                    }}
                  >
                    Save
                  </Button>
                  <IconButton
                    onClick={handleCancelEdit}
                    sx={{ color: "#FF0000" }}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="body1" sx={{ color: "#353E6C" }}>
                    {newGroupName}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleEditClick}
                    sx={{
                      color: "#007AFF",
                      borderColor: "#007AFF",
                      borderRadius: "8px",
                    }}
                  >
                    Edit
                  </Button>
                </Box>
              )}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography variant="body1" sx={{ color: "#353E6C" }}>
                Default Currency:
              </Typography>
            </TableCell>
            <TableCell>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <Select
                  sx={{ width: "30%" }}
                  labelId="currency-select-label"
                  id="currency-select"
                  value={currency}
                  onChange={handleCurrencyChange}
                  required
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
                  color="primary"
                  onClick={handleSaveCurrency}
                  disabled={!isCurrencyChanged} // Disable if currency is not changed
                  sx={{
                    width: "10%",
                    backgroundColor: "#007AFF",
                    color: "#FFF",
                    borderRadius: "8px",
                    height: "2rem",
                  }}
                >
                  Save
                </Button>
              </Box>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Typography variant="body1" sx={{ color: "#353E6C" }}>
                Delete Group:
              </Typography>
            </TableCell>
            <TableCell>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
                sx={{
                  backgroundColor: "#FD7289",
                  color: "#FFF",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  borderRadius: "8px",
                }}
              >
                <DeleteForeverIcon />
                Delete Group
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

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
