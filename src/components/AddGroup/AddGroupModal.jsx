import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Stepper,
  Step,
  StepLabel,
  FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Groups2Icon from "@mui/icons-material/Groups2";
import FlightIcon from "@mui/icons-material/Flight";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CategoryIcon from "@mui/icons-material/Category";
import { v4 as uuidv4 } from "uuid";
import GroupService from "../services/group.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import userService from "../services/user.service";
import ActivityService from "../services/activity.service";
import { currencies } from "../../constants";
import { Box as MuiBox } from "@mui/material";
import { useFriends } from "../contexts/FriendsContext";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useCurrentGroup } from "../contexts/CurrentGroup";

const AddGroupModal = ({ open, handleClose, refreshGroups, onGroupCreated }) => {
  const { setCurrentGroupID } = useCurrentGroup();
  const navigate = useNavigate();
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
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({
    groupName: "",
    category: "",
  });

  const steps = ["Group Details", "Currency", "Members"];

  const userObjWithName = { email: inputEmail, name: name };

  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && currentUser?.email) {
      refreshFriends(currentUser.email);
    }
  }, [open, currentUser]);

  useEffect(() => {
    if (suggestions.length > 0 && inputEmail && inputRef.current) {
      inputRef.current.focus();
    }
  }, [suggestions, inputEmail]);

  const resetAddMembers = (e) => {
    e.preventDefault();
    setShowNameField(false);
    setInputEmail("");
    setName("");
    setError("");
  };

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setCategory("");
    setMembers([]);
    setInputEmail("");
    setError("");
    setDefaultCurrency("INR");
    setActiveStep(0);
    setShowNameField(false);
    setName("");
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
          !members.some((member) => member.email === friend.email) &&
          ((friend.name &&
            friend.name.toLowerCase().includes(value.toLowerCase())) ||
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

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = { ...errors };

    switch (step) {
      case 0:
        if (!groupName.trim()) {
          newErrors.groupName = "Group name is required";
          isValid = false;
        }
        if (!category) {
          newErrors.category = "Category is required";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
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

      resetForm();
      setSnackBar({
        isOpen: true,
        message: "Group created",
      });
      localStorage.setItem("currentGroupID", JSON.stringify(newGroup?.id));
      if (typeof setCurrentGroupID === 'function') setCurrentGroupID(newGroup?.id);
      if (typeof refreshGroups === 'function') refreshGroups();
      if (typeof handleClose === 'function') handleClose();
      setTimeout(() => {
        if (typeof navigate === 'function') navigate("/groups");
      }, 200);
    } catch (error) {
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label="Group Name"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                setErrors({ ...errors, groupName: "" });
              }}
              required
              error={!!errors.groupName}
              helperText={
                errors.groupName || `${25 - groupName.length} characters remaining`
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 20px rgba(94, 114, 228, 0.1)",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(94, 114, 228, 0.15)",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Group Description"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 20px rgba(94, 114, 228, 0.1)",
                  },
                  "&.Mui-focused": {
                    backgroundColor: "white",
                    boxShadow: "0 4px 20px rgba(94, 114, 228, 0.15)",
                  },
                },
              }}
            />

            <FormControl fullWidth error={!!errors.category}>
              <InputLabel required>Category</InputLabel>
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setErrors({ ...errors, category: "" });
                }}
                required
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 20px rgba(94, 114, 228, 0.1)",
                  },
                }}
              >
                <MenuItem value="Trip" sx={{ borderRadius: "12px", my: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <FlightIcon sx={{ color: "#fb6340" }} />
                    <Typography>Trip</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Home" sx={{ borderRadius: "12px", my: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <HomeIcon sx={{ color: "#2dce89" }} />
                    <Typography>Home</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Couple" sx={{ borderRadius: "12px", my: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <FavoriteIcon sx={{ color: "#f5365c" }} />
                    <Typography>Couple</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="Other" sx={{ borderRadius: "12px", my: 0.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CategoryIcon sx={{ color: "#8898aa" }} />
                    <Typography>Other</Typography>
                  </Box>
                </MenuItem>
              </Select>
              {errors.category && (
                <FormHelperText error>{errors.category}</FormHelperText>
              )}
            </FormControl>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Default Currency</InputLabel>
              <Select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                required
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    boxShadow: "0 4px 20px rgba(94, 114, 228, 0.1)",
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
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl fullWidth>
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
              <Box sx={{ position: "relative" }}> {/* Added margin bottom here */}
                <TextField
                  ref={inputRef}
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
                  <MuiBox
                    ref={suggestionsRef}
                    tabIndex={-1}
                    sx={{
                      position: "absolute",
                      width: "100%",
                      maxHeight: "300px",
                      backgroundColor: "white",
                      borderRadius: "16px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                      zIndex: 99999,
                      border: "1px solid rgba(94, 114, 228, 0.2)",
                      overflow: "auto",
                      top: "calc(100% + 8px)",
                      left: 0,
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(94, 114, 228, 0.2)",
                        borderRadius: "8px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "rgba(94, 114, 228, 0.05)",
                        borderRadius: "8px",
                      },
                      "&:focus": {
                        outline: "none", // Remove outline since input will maintain focus
                      },
                    }}
                    onMouseDown={(e) => {
                      // Prevent input from losing focus when clicking suggestions
                      e.preventDefault();
                    }}
                  >
                    {suggestions.map((friend) => (
                      <Box
                        key={friend.email}
                        sx={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(94, 114, 228, 0.08)",
                          },
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                        onClick={() => handleSelectFriend(friend)}
                      >
                        <Avatar
                          src={friend.profilePicture}
                          alt={friend.name}
                          sx={{
                            width: 40,
                            height: 40,
                            border: "2px solid #fff",
                            boxShadow: "0 2px 10px rgba(94,114,228,0.2)",
                          }}
                        >
                          {friend.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: "#32325d" }}>
                            {friend.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#8898aa" }}>
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
                <Typography
                  variant="body2"
                  sx={{ marginTop: "0.5rem", color: "#FFBB38" }}
                >
                  Searching user...
                </Typography>
              )}
              {error && <Alert severity="error">{error}</Alert>}
            </FormControl>
          </Box>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: { xs: "24px", sm: "24px" }, // Flat top on mobile
          background:
            "linear-gradient(155deg, rgba(255,255,255,0.95) 0%, rgba(248,249,254,0.95) 100%)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.8)",
          overflow: "hidden",
          maxHeight: { xs: '90vh', sm: '500px' },
          m: { xs: 4, sm: 'auto' }, // Remove margin on mobile
          position: 'relative',
          // Position at top for mobile
          top: { xs: 0, sm: 'auto' }
        },
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: { xs: 'flex-start', sm: 'center' } // Align to top on mobile
        }
      }}
    >
      <DialogTitle
        sx={{
          pb: 0,
          pt: 3,
          px: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="h6" component="h2">
          Create Group
        </Typography>
        <IconButton 
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ 
        overflowY: 'auto',
        px: { xs: 2.5, sm: 3.5 },
        pb: { xs: 2, sm: 3 },
        height: activeStep === 2 ? { xs: '40vh', sm: '45vh' } : 'auto', // Decreased from 45vh/50vh to 40vh/45vh
        '&::-webkit-scrollbar': {
          width: '8px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(94, 114, 228, 0.2)',
          borderRadius: '8px'
        }
      }}>
        <Stepper
          activeStep={activeStep}
          sx={{
            pt: 3,
            "& .MuiStepLabel-root .Mui-completed": {
              color: "#2dce89",
            },
            "& .MuiStepLabel-root .Mui-active": {
              color: "#5e72e4",
            },
          }}
        >
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 2.5, sm: 3.5 },
          py: { xs: 2, sm: 3 },
          borderTop: '1px solid rgba(94, 114, 228, 0.1)',
          bgcolor: 'rgba(255,255,255,0.9)',
          mt: 'auto'
        }}
      >
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((prev) => prev - 1)}
          sx={{
            textTransform: "none",
            color: "#5e72e4",
            "&:hover": {
              backgroundColor: "rgba(94, 114, 228, 0.1)",
            },
          }}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#5e72e4",
              "&:hover": {
                backgroundColor: "#2dce89",
              },
            }}
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
        ) : (
          <Button
            onClick={handleNext}
            variant="contained"
            sx={{
              textTransform: "none",
              backgroundColor: "#5e72e4",
              "&:hover": {
                backgroundColor: "#2dce89",
              },
            }}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

AddGroupModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  refreshGroups: PropTypes.func.isRequired,
  onGroupCreated: PropTypes.func,
};

export default AddGroupModal;
