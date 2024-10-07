import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckBox from "@mui/material/Checkbox";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAllGroups } from "../contexts/AllGroups";
import GroupService from "../services/group.service"; // Import the GroupService
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useCurrentUser } from "../contexts/CurrentUser";
import { v4 as uuidv4 } from "uuid";

const styles = {
  modalBox: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 400,
    bgcolor: "#FFF",
    borderRadius: "16px",
    boxShadow: 24,
    p: 4,
  },
  button: {
    backgroundColor: "#8675FF",
    color: "#FFF",
    "&:hover": {
      backgroundColor: "#FD7289",
    },
  },
  title: {
    marginBottom: 5,
    color: "#353E6C",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formControl: {
    marginBottom: "1rem",
    width: "100%",
  },
};

const AddExpenseModal = ({ open, handleClose }) => {
  const [group, setGroup] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitOptions, setSplitOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { allGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { refreshAllGroups } = useAllGroups();
  const { currentUser } = useCurrentUser();

  const userNameByEmail = users?.find((item) => item.email === paidBy)?.name;

  useEffect(() => {
    if (group) {
      const selectedGroup = allGroups.find((g) => g.title === group);
      if (selectedGroup && selectedGroup.members) {
        setUsers(
          selectedGroup.members.map((member) => ({
            name: member?.name,
            avatar: member?.profilePicture,
            email: member?.email, // Add the email here
            firstInitial: member?.name?.[0],
          }))
        );
      }
    } else {
      setUsers([]);
    }
  }, [group, allGroups]);

  const handleSplitChange = (event) => {
    const emails = event.target.value; // Get the selected emails
    const uniqueEmails = new Set(splitOptions.map((option) => option.email)); // Create a Set from existing emails in splitOptions

    // New split options after processing the selected emails
    const newOptions = emails
      .map((email) => {
        const userNameByEmail = users?.find(
          (item) => item.email === email
        )?.name;
        if (userNameByEmail) {
          return { email: email, name: userNameByEmail }; // Return the new option
        }
        return null; // Return null if user not found
      })
      .filter(Boolean); // Filter out null values

    // Update splitOptions based on whether the email already exists
    setSplitOptions((prevOptions) => {
      const existingEmails = new Set(prevOptions.map((option) => option.email)); // Get existing emails

      // Create a new array based on the selected emails
      return newOptions.reduce((updatedOptions, option) => {
        // If the email exists, remove it; otherwise, add it
        if (existingEmails.has(option.email)) {
          return updatedOptions.filter((item) => item.email !== option.email); // Remove existing email
        } else {
          return [...updatedOptions, option]; // Add new option
        }
      }, prevOptions);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (splitOptions?.length <= 0) {
      return;
    }

    const expense = {
      id: uuidv4(),
      description,
      amount: Number(amount), // Convert to a number
      paidBy: { email: paidBy, name: userNameByEmail },
      splitBetween: splitOptions, // Now stores emails
      createdDate: selectedDate.toISOString(), // Format the date as needed
      createdBy: { email: currentUser?.email, name: currentUser?.name },
    };

    try {
      setLoading(true);
      const selectedGroupID = allGroups.find(
        (item) => item?.title === group
      )?.id;
      await GroupService.addExpenseToGroup(selectedGroupID, expense);

      handleClose(); // Close the modal after successful submission
      setSnackBar({
        isOpen: true,
        message: "Expense added",
      });
      setDescription("");
      setAmount("");
      setPaidBy("");
      setSplitOptions([]);
      setSelectedDate(dayjs());
      refreshAllGroups();
    } catch (error) {
      console.error("Failed to add expense:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={styles.modalBox}>
        <div style={styles.title}>
          <Typography variant="h6" component="h2" gutterBottom>
            Add Expense
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth sx={styles.formControl} required>
            <InputLabel>Select Group</InputLabel>
            <Select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              required
            >
              {allGroups.map((group, index) => (
                <MenuItem key={index} value={group.title}>
                  <Typography variant="body1">{group.title}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            required
            fullWidth
            sx={styles.formControl}
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!group} // Disable until group is selected
            inputProps={{ maxLength: 35 }} // Enforces max length
            helperText={`${35 - description.length} characters remaining`}
          />

          <TextField
            fullWidth
            sx={styles.formControl}
            label="Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={!group} // Disable until group is selected
          />

          <FormControl fullWidth sx={styles.formControl} required>
            <InputLabel>Paid By</InputLabel>
            <Select
              value={paidBy}
              onChange={(e) => {
                setPaidBy(e.target.value);
                // Remove the selected user from splitOptions if present
                if (
                  splitOptions.some((option) => option.email === e.target.value)
                ) {
                  setSplitOptions(
                    splitOptions.filter(
                      (user) => user?.email !== e.target.value
                    )
                  );
                }
              }}
              required
              disabled={!group} // Disable until group is selected
            >
              {users.map((user) => (
                <MenuItem key={user.email} value={user.email}>
                  <Typography variant="body1">{user.name}</Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={styles.formControl}>
            <InputLabel>Split equally between</InputLabel>
            <Select
              multiple
              value={splitOptions}
              onChange={handleSplitChange}
              required
              renderValue={(selected) => (
                <div>
                  {selected.length > 2
                    ? selected.slice(0, 2).map((email) => {
                        const user = users.find((u) => u.email === email);
                        return (
                          <Chip
                            key={email}
                            label={user?.name}
                            avatar={
                              user?.avatar ? (
                                <Avatar src={user.avatar} alt={user.name} />
                              ) : (
                                <Avatar>{user?.firstInitial}</Avatar>
                              )
                            }
                            sx={{ margin: "0.2rem" }}
                          />
                        );
                      })
                    : selected.map(({ name, email }) => {
                        const user = users.find((u) => u.email === email);
                        return (
                          <Chip
                            key={email}
                            label={user?.name}
                            avatar={
                              user?.avatar ? (
                                <Avatar src={user.avatar} alt={user.name} />
                              ) : (
                                <Avatar>{user?.firstInitial}</Avatar>
                              )
                            }
                            sx={{ margin: "0.2rem" }}
                          />
                        );
                      })}
                  {selected.length > 2 && (
                    <Chip label={`+${selected.length - 2} more`} />
                  )}
                </div>
              )}
              disabled={!paidBy || users?.length <= 1} // Disable until paidBy is selected
            >
              {users
                .filter((user) => user.email !== paidBy) // Filter out the user selected in "Paid By"
                .map((user) => (
                  <MenuItem key={user.email} value={user.email}>
                    <CheckBox
                      checked={splitOptions.some(
                        (option) => option.email === user?.email
                      )}
                    />
                    <ListItemText
                      primary={
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={user.avatar}
                            alt={user.name}
                            sx={{ marginRight: 1 }}
                          >
                            {!user.avatar && user.firstInitial}
                          </Avatar>
                          {user.name}
                        </div>
                      }
                    />
                  </MenuItem>
                ))}
            </Select>
            {group && users?.length <= 1 && (
              <Alert
                severity="error"
                sx={{
                  fontSize: 10,
                  "& .MuiAlert-icon": {
                    // Targeting the icon specifically
                    fontSize: 16, // Adjust the size as needed
                  },
                }}
              >
                Add more members to split the expense
              </Alert>
            )}
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              sx={{ width: "100%", marginBottom: "15px" }}
              label="Expense Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  sx={styles.formControl}
                  required
                />
              )}
            />
          </LocalizationProvider>

          <Button
            type="submit"
            variant="contained"
            sx={{ ...styles.button, marginTop: "15px" }}
            disabled={
              !description ||
              !group ||
              !amount ||
              !paidBy ||
              splitOptions?.length <= 0
            }
          >
            Add Expense
            {loading && (
              <CircularProgress
                color="success"
                size={20}
                sx={{ marginLeft: 2 }}
              />
            )}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddExpenseModal;
