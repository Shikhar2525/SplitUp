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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckBox from "@mui/material/Checkbox";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAllGroups } from "../contexts/AllGroups";

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

  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (group) {
      const selectedGroup = allGroups.find((g) => g.title === group);
      if (selectedGroup && selectedGroup.members) {
        setUsers(
          selectedGroup.members.map((member) => ({
            name: member?.firstName
              ? `${member?.firstName} ${member?.lastName}`
              : member?.email,
            avatar: member?.profilePicture,
            firstInitial: member?.firstName ? member?.firstName[0] : "",
          }))
        );
      }
    } else {
      setUsers([]);
    }
  }, [group, allGroups]);

  const handleSplitChange = (event) => {
    const value = event.target.value;
    // Remove the "paidBy" user from the split options if they are selected
    setSplitOptions(
      typeof value === "string"
        ? value.split(",").filter((user) => user !== paidBy)
        : value.filter((user) => user !== paidBy)
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      group,
      description,
      amount,
      paidBy,
      splitOptions,
      selectedDate,
    });
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
            fullWidth
            sx={styles.formControl}
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!group} // Disable until group is selected
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
                if (splitOptions.includes(e.target.value)) {
                  setSplitOptions(
                    splitOptions.filter((user) => user !== e.target.value)
                  );
                }
              }}
              required
              disabled={!group} // Disable until group is selected
            >
              {users.map((user) => (
                <MenuItem key={user.name} value={user.name}>
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
              renderValue={(selected) => (
                <div>
                  {selected.length > 2
                    ? selected.slice(0, 2).map((value) => {
                        const user = users.find((u) => u.name === value);
                        return (
                          <Chip
                            key={value}
                            label={value}
                            avatar={
                              user?.avatar ? (
                                <Avatar src={user.avatar} alt={value} />
                              ) : (
                                <Avatar>{user?.firstInitial}</Avatar>
                              )
                            }
                            sx={{ margin: "0.2rem" }}
                          />
                        );
                      })
                    : selected.map((value) => {
                        const user = users.find((u) => u.name === value);
                        return (
                          <Chip
                            key={value}
                            label={value}
                            avatar={
                              user?.avatar ? (
                                <Avatar src={user.avatar} alt={value} />
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
              disabled={!paidBy} // Disable until paidBy is selected
            >
              {users
                .filter((user) => user.name !== paidBy) // Filter out the user selected in "Paid By"
                .map((user) => (
                  <MenuItem key={user.name} value={user.name}>
                    <CheckBox checked={splitOptions.indexOf(user.name) > -1} />
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
                  disabled={!group} // Disable until group is selected
                />
              )}
              required
              disabled={!group} // Disable the DatePicker until a group is selected
            />
          </LocalizationProvider>

          <Button
            type="submit"
            variant="contained"
            sx={styles.button}
            fullWidth
            disabled={!group || !paidBy} // Disable until group and paidBy are selected
          >
            Add Expense
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddExpenseModal;
