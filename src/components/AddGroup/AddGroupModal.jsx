import React, { useState, useEffect } from "react";
import {
  Modal,
  Box,
  Button,
  TextField,
  FormControl,
  Typography,
  IconButton,
  Chip,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  CircularProgress,
  Avatar,
  Link,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { v4 as uuidv4 } from "uuid";
import GroupService from "../services/group.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import userService from "../services/user.service";
import ActivityService from "../services/activity.service";
import { currencies } from "../../constants";
import { Box as MuiBox } from "@mui/material";
import { useFriends } from "../contexts/FriendsContext";

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
    marginBottom: "0.6rem",
    width: "100%",
  },
  searchingMessage: {
    marginTop: "0.5rem",
    color: "#FFBB38",
  },
  suggestionBox: {
    position: "absolute",
    width: "100%",
    maxHeight: "200px",
    overflowY: "auto",
    backgroundColor: "white",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    zIndex: 1000,
  },
  suggestionItem: {
    padding: "8px 16px",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "rgba(94, 114, 228, 0.05)",
    },
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
};

const AddGroupModal = ({ open, handleClose, refreshGroups }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [category, setCategory] = useState("");
  const [members, setMembers] = useState([]);
  const [inputEmail, setInputEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [name, setName] = useState("");
  const [showNameField, setShowNameField] = useState(false);
  const { currentUser } = useCurrentUser();
  const { setSnackBar } = useTopSnackBar();
  const [defaultCurrency, setDefaultCurrency] = useState("INR");
  const [suggestions, setSuggestions] = useState([]);
  const { userFriends, refreshFriends } = useFriends();

  const userObjWithName = { email: inputEmail, name: name };

  useEffect(() => {
    if (open && currentUser?.email) {
      refreshFriends(currentUser.email);
    }
  }, [open, currentUser]);

  const resetAddMembers = (e) => {
    e.preventDefault();
    setShowNameField(false);
    setInputEmail("");
    setName("");
    setError("");
  };

  const handleEmailAdd = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!validateEmail(inputEmail)) {
        setError("Email is wrong");
      } else if (members.some((member) => member.email === inputEmail)) {
        setError("This email is already added.");
      } else if (inputEmail === currentUser?.email) {
        setError("Admin cannot be added as a member.");
      } else {
        setEmailLoading(true);

        try {
          const fetchedUser = await userService.getUserByEmail(inputEmail);
          if (fetchedUser) {
            setMembers((prevMembers) => [...prevMembers, fetchedUser]);
            setError("");
            setInputEmail("");
          } else {
            setShowNameField(true);
            setError("User not found, enter name");
          }
        } catch (err) {
          setError("Error fetching user.");
        } finally {
          setEmailLoading(false);
        }
      }
    }
  };

  const handleName = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setMembers((prevMembers) => [...prevMembers, userObjWithName]);
      setShowNameField(false);
      setInputEmail("");
      setError("");
    }
  };

  const handleDeleteMember = (emailToDelete) => {
    setMembers((prevMembers) =>
      prevMembers.filter((member) => member.email !== emailToDelete)
    );
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setInputEmail(value);

    if (value) {
      const filtered = userFriends.filter(
        (friend) =>
          !members.some((member) => member.email === friend.email) && // Filter out already added members
          ((friend.name && friend.name.toLowerCase().includes(value.toLowerCase())) ||
          friend.email.toLowerCase().includes(value.toLowerCase()))
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectFriend = (friend) => {
    if (!members.some((member) => member.email === friend.email)) {
      setMembers((prev) => [...prev, friend]);
    }
    setInputEmail("");
    setSuggestions([]);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const adminUserObject = await userService.getUserByEmail(
      currentUser?.email
    );

    const newGroup = {
      id: uuidv4(),
      title: groupName,
      description: groupDescription,
      category: category,
      members: [adminUserObject, ...members],
      createdDate: new Date(),
      isAllSettled: false,
      expenses: [],
      admin: adminUserObject,
      defaultCurrency,
    };

    try {
      await GroupService.createGroup(newGroup);

      const log = {
        logId: uuidv4(),
        logType: "createGroup",
        details: {
          performedBy: { email: currentUser?.email, name: currentUser?.name },
          date: new Date(),
          groupTitle: groupName,
          groupId: newGroup?.id,
          members: newGroup?.members,
        },
      };

      await ActivityService.addActivityLog(log);

      setGroupName("");
      setGroupDescription("");
      setCategory("");
      setMembers([]);
      setInputEmail("");
      setError("");

      handleClose();
      setSnackBar({
        isOpen: true,
        message: "Group created",
      });
      localStorage.setItem("currentGroupID", JSON.stringify(newGroup?.id));
      refreshGroups();
    } catch (error) {
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={styles.modalBox}>
        <div style={styles.title}>
          <Typography variant="h6" component="h2" gutterBottom>
            Create Group
          </Typography>
          <IconButton onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
        </div>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            sx={styles.formControl}
            label="Group Name"
            variant="outlined"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            inputProps={{ maxLength: 25 }}
            helperText={`${25 - groupName.length} characters remaining`}
            required
          />
          <TextField
            fullWidth
            sx={styles.formControl}
            label="Group Description"
            variant="outlined"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            inputProps={{ maxLength: 35 }}
            helperText={`${35 - groupDescription.length} characters remaining`}
          />
          <FormControl fullWidth sx={styles.formControl}>
            <InputLabel id="category-label" shrink={!!category}>
              Category *
            </InputLabel>
            <Select
              labelId="category-label"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              variant="outlined"
              required
            >
              <MenuItem value="Trip">Trip</MenuItem>
              <MenuItem value="Home">Home</MenuItem>
              <MenuItem value="Couple">Couple</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            sx={{ ...styles.formControl, ...{ marginTop: 2, marginBottom: 2 } }}
          >
            <InputLabel id="currency-select-label">Currency *</InputLabel>
            <Select
              required
              labelId="currency-select-label"
              id="currency-select"
              value={defaultCurrency}
              label="Currency"
              onChange={(e) => setDefaultCurrency(e.target.value)}
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
          </FormControl>

          <FormControl fullWidth sx={styles.formControl}>
            <div>
              {members?.map((member, index) => (
                <Chip
                  key={index}
                  label={member?.name}
                  avatar={
                    <Avatar alt={member?.email} src={member?.profilePicture}>
                      {member?.email.charAt(0)}
                    </Avatar>
                  }
                  onDelete={() => handleDeleteMember(member?.email)}
                  sx={{ marginRight: 1, marginTop: 1 }}
                />
              ))}
            </div>
            <Box sx={{ position: "relative" }}>
              <TextField
                disabled={showNameField}
                label="Add Members"
                variant="outlined"
                value={inputEmail}
                onChange={handleEmailChange}
                onKeyDown={handleEmailAdd}
                fullWidth
                sx={{ marginTop: members.length > 0 ? "1rem" : 0 }}
                helperText="Type to search friends or press 'Enter' to add new member"
              />
              {suggestions.length > 0 && inputEmail && (
                <MuiBox sx={styles.suggestionBox}>
                  {suggestions.map((friend) => (
                    <Box
                      key={friend.email}
                      sx={styles.suggestionItem}
                      onClick={() => handleSelectFriend(friend)}
                    >
                      <Avatar
                        src={friend.profilePicture}
                        alt={friend.name}
                        sx={{ width: 32, height: 32 }}
                      >
                        {friend.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {friend.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {friend.email}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </MuiBox>
              )}
            </Box>
            {showNameField && (
              <TextField
                label="Enter Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleName}
                fullWidth
                sx={{ marginTop: "1rem" }}
                helperText="Press 'Enter' to add name"
              />
            )}
            {emailLoading && (
              <Typography variant="body2" sx={styles.searchingMessage}>
                Searching user...
              </Typography>
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </FormControl>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              onClick={resetAddMembers}
              variant="body2"
              sx={{ marginLeft: 0.7 }}
            >
              Reset email
            </Link>
            <Button
              type="submit"
              variant="contained"
              sx={styles.button}
              disabled={loading || emailLoading}
            >
              Create Group
              {loading && (
                <CircularProgress
                  color="success"
                  size={20}
                  sx={{ marginLeft: 2 }}
                />
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default AddGroupModal;
