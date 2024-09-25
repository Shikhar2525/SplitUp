import React, { useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckBox from "@mui/material/Checkbox";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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
    marginBottom: "1rem", // Same margin for all fields
    width: "100%", // Full width for all fields
  },
};

const AddExpenseModal = ({ open, handleClose }) => {
  const [group, setGroup] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitOptions, setSplitOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const users = ["User 1", "User 2", "User 3", "User 4"];

  const handleSplitChange = (event) => {
    const value = event.target.value;
    setSplitOptions(typeof value === "string" ? value.split(",") : value);
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
              <MenuItem value={"Group 1"}>Group 1</MenuItem>
              <MenuItem value={"Group 2"}>Group 2</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            sx={styles.formControl}
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
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
          />

          <FormControl fullWidth sx={styles.formControl} required>
            <InputLabel>Paid By</InputLabel>
            <Select
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              required
            >
              <MenuItem value={"User 1"}>User 1</MenuItem>
              <MenuItem value={"User 2"}>User 2</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={styles.formControl}>
            <InputLabel>Split euqally between</InputLabel>
            <Select
              multiple
              value={splitOptions}
              onChange={handleSplitChange}
              renderValue={(selected) => (
                <div>
                  {selected.map((value) => (
                    <Chip key={value} label={value} sx={{ margin: "0.2rem" }} />
                  ))}
                </div>
              )}
            >
              {users.map((user) => (
                <MenuItem key={user} value={user}>
                  <CheckBox checked={splitOptions.indexOf(user) > -1} />
                  <ListItemText primary={user} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Picker with consistent margin and width */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              sx={{ width: "100%", marginBottom: "15px" }}
              label="Expense Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => (
                <TextField {...params} fullWidth sx={styles.formControl} />
              )}
            />
          </LocalizationProvider>

          <Button
            type="submit"
            variant="contained"
            sx={styles.button}
            fullWidth
          >
            Add Expense
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default AddExpenseModal;
