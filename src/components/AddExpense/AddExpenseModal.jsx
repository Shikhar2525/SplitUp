import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Avatar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  FormHelperText,
  OutlinedInput,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";
import PaidIcon from "@mui/icons-material/Paid";
import GroupIcon from "@mui/icons-material/Group";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useAllGroups } from "../contexts/AllGroups";
import GroupService from "../services/group.service";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import { useCurrentUser } from "../contexts/CurrentUser";
import { v4 as uuidv4 } from "uuid";
import ActivityService from "../services/activity.service";
import { currencies } from "../../constants";
import { useRefetchLogs } from "../contexts/RefetchLogs";
import { useCurrentGroup } from "../contexts/CurrentGroup";

const steps = [
  { label: "Description", icon: <InfoIcon /> },
  { label: "Amount", icon: <PaidIcon /> },
  { label: "Split Details", icon: <GroupIcon /> },
];

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
  const [currency, setCurrency] = useState("");
  const { refetchLogs, setRefetchLogs } = useRefetchLogs();
  const { currentGroupID } = useCurrentGroup();
  const [excludePayer, setExcludePayer] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({
    description: "",
    amount: "",
    currency: "",
    paidBy: "",
    splitOptions: "",
  });

  const currentGroupObj = allGroups.find(
    (group) => group?.id === currentGroupID
  );

  const userNameByEmail = users?.find((item) => item.email === paidBy)?.name;

  useEffect(() => {
    setGroup(currentGroupObj?.title);
  }, [currentGroupObj]);

  useEffect(() => {
    if (group) {
      const selectedGroup = allGroups.find((g) => g.title === group);
      setCurrency(selectedGroup?.defaultCurrency || "INR");
      if (selectedGroup && selectedGroup.members) {
        setUsers(
          selectedGroup.members.map((member) => ({
            name: member?.name,
            avatar: member?.profilePicture,
            email: member?.email,
            firstInitial: member?.name?.[0],
          }))
        );
      }
    } else {
      setUsers([]);
    }
  }, [group, allGroups]);

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = { ...errors };

    switch (step) {
      case 0:
        if (!description.trim()) {
          newErrors.description = "Description is required";
          isValid = false;
        }
        break;

      case 1:
        if (!amount || amount <= 0) {
          newErrors.amount = "Amount must be greater than 0";
          isValid = false;
        }
        if (!currency) {
          newErrors.currency = "Currency is required";
          isValid = false;
        }
        break;

      case 2:
        if (!paidBy) {
          newErrors.paidBy = "Please select who paid";
          isValid = false;
        }
        if (splitOptions.length === 0) {
          newErrors.splitOptions =
            "Please select at least one person to split with";
          isValid = false;
        }
        break;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSplitChange = (event) => {
    const selectedEmails = event.target.value;
    const newSplitOptions = selectedEmails.map((email) => {
      const user = users.find((u) => u.email === email);
      return {
        email: email,
        name: user?.name,
      };
    });
    setSplitOptions(newSplitOptions);
    setErrors({ ...errors, splitOptions: "" });
  };

  const handlePaidByChange = (e) => {
    const selectedPayer = e.target.value;
    setPaidBy(selectedPayer);
    setErrors({ ...errors, paidBy: "" });

    setSplitOptions((prev) => prev.filter((option) => option.email !== selectedPayer));
  };

  const handleRemoveSplit = (email) => {
    setSplitOptions((prev) => prev.filter((option) => option.email !== email));
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplitOptions([]);
    setSelectedDate(dayjs());
    setActiveStep(0);
    setExcludePayer(false);
    setErrors({
      description: "",
      amount: "",
      currency: "",
      paidBy: "",
      splitOptions: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(activeStep)) {
      return;
    }

    if (splitOptions?.length <= 0) {
      return;
    }
    const expense = {
      id: uuidv4(),
      description,
      amount: Number(amount),
      paidBy: { email: paidBy, name: userNameByEmail },
      splitBetween: splitOptions,
      createdDate: selectedDate.toISOString(),
      createdBy: { email: currentUser?.email, name: currentUser?.name },
      currency,
      excludePayer,
    };

    try {
      setLoading(true);
      const selectedGroupID = allGroups.find(
        (item) => item?.title === group
      )?.id;
      await GroupService.addExpenseToGroup(selectedGroupID, expense);

      const log = {
        logId: uuidv4(),
        logType: "addExpense",
        details: {
          expenseTitle: description,
          performedBy: { email: currentUser?.email, name: currentUser?.name },
          date: new Date(),
          groupTitle: group,
          groupId: selectedGroupID,
          amount: Number(amount),
          splitBetween: splitOptions.map((option) => option.email),
          currency,
        },
      };

      await ActivityService.addActivityLog(log);

      setRefetchLogs(!refetchLogs);
      resetForm();
      handleClose();
      setSnackBar({
        isOpen: true,
        message: "Expense added",
      });
      refreshAllGroups();
    } catch (error) {
      console.error("Failed to add expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getCurrencySymbol = (currency) => {
    const currencyObj = currencies.find((c) => c.value === currency);
    return currencyObj ? currencyObj.symbol : currency;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors({ ...errors, description: "" });
              }}
              required
              error={!!errors.description}
              helperText={errors.description || `${35 - description.length} characters remaining`}
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
              inputProps={{ maxLength: 35 }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Expense Date"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.8)",
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setErrors({ ...errors, amount: "" });
              }}
              required
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography
                      sx={{
                        color: "#5e72e4",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                      }}
                    >
                      {getCurrencySymbol(currency)}
                    </Typography>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                },
              }}
            />

            <FormControl error={!!errors.currency}>
              <InputLabel required>Currency</InputLabel>
              <Select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  setErrors({ ...errors, currency: "" });
                }}
                required
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                }}
              >
                {currencies.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      borderRadius: "12px",
                      my: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <Avatar
                        src={option.flag}
                        alt={option.value}
                        variant="rounded"
                        sx={{ width: 24, height: 24 }}
                      />
                      <Typography>{option.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.currency && (
                <FormHelperText error>{errors.currency}</FormHelperText>
              )}
            </FormControl>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            <FormControl error={!!errors.paidBy}>
              <InputLabel required>Paid By</InputLabel>
              <Select
                value={paidBy}
                onChange={(e) => {
                  handlePaidByChange(e);
                  setErrors({ ...errors, paidBy: "" });
                }}
                required
                sx={{
                  borderRadius: "16px",
                  backgroundColor: "rgba(255,255,255,0.8)",
                }}
              >
                {users.map((user) => (
                  <MenuItem
                    key={user.email}
                    value={user.email}
                    sx={{
                      borderRadius: "12px",
                      my: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 1,
                      }}
                    >
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 10px rgba(94,114,228,0.2)",
                        }}
                      >
                        {user.firstInitial}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              {errors.paidBy && (
                <FormHelperText error>{errors.paidBy}</FormHelperText>
              )}
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={excludePayer}
                  onChange={(e) => setExcludePayer(e.target.checked)}
                  sx={{
                    color: "#5e72e4",
                    "&.Mui-checked": {
                      color: "#5e72e4",
                    },
                  }}
                />
              }
              label="Don't include payer in split"
              sx={{
                border: "1px dashed rgba(94,114,228,0.3)",
                borderRadius: "12px",
                py: 1,
                px: 2,
              }}
            />

            <FormControl error={!!errors.splitOptions}>
              <InputLabel required>Split Between</InputLabel>
              <Select
                multiple
                value={splitOptions.map((option) => option.email)}
                onChange={(e) => {
                  handleSplitChange(e);
                  setErrors({ ...errors, splitOptions: "" });
                }}
                required
                input={<OutlinedInput label="Split Between" />}
                sx={{
                  minHeight: 56,
                  borderRadius: "16px",
                  "& .MuiSelect-select": {
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                    p: 1.5,
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      mt: 1,
                      borderRadius: "16px",
                      maxHeight: 300,
                      "&::-webkit-scrollbar": {
                        width: "8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(94, 114, 228, 0.2)",
                        borderRadius: "4px",
                      },
                    },
                  },
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => {
                      const user = users.find((u) => u.email === value);
                      return (
                        <Chip
                          key={value}
                          label={user?.name}
                          avatar={
                            <Avatar src={user?.avatar}>
                              {user?.firstInitial}
                            </Avatar>
                          }
                          sx={{
                            borderRadius: "12px",
                            backgroundColor: "rgba(94, 114, 228, 0.1)",
                            border: "1px solid rgba(94, 114, 228, 0.2)",
                            "& .MuiChip-label": {
                              color: "#5e72e4",
                              fontWeight: 600,
                            },
                          }}
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {users
                  .filter((user) => user.email !== paidBy)
                  .map((user) => (
                    <MenuItem
                      key={user.email}
                      value={user.email}
                      sx={{
                        borderRadius: "12px",
                        my: 0.5,
                        mx: 1,
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: "rgba(94, 114, 228, 0.08)",
                        },
                        "&.Mui-selected": {
                          backgroundColor: "rgba(94, 114, 228, 0.12)",
                          "&:hover": {
                            backgroundColor: "rgba(94, 114, 228, 0.15)",
                          },
                        },
                      }}
                    >
                      <Checkbox
                        checked={splitOptions.some(
                          (option) => option.email === user.email
                        )}
                        sx={{
                          color: "#5e72e4",
                          "&.Mui-checked": {
                            color: "#5e72e4",
                          },
                        }}
                      />
                      <Avatar
                        src={user.avatar}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 10px rgba(94,114,228,0.2)",
                        }}
                      >
                        {user.firstInitial}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: "#32325d",
                            fontSize: "0.9rem",
                          }}
                        >
                          {user.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#8898aa" }}>
                          {user.email}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
              {errors.splitOptions && (
                <FormHelperText error>{errors.splitOptions}</FormHelperText>
              )}
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
        sx: {
          borderRadius: "20px",
          background: "linear-gradient(135deg, #fff 0%, #f8f9fe 100%)",
        },
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" sx={{ color: "#32325d", fontWeight: 600 }}>
            Add Expense
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
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
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={() => (
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor:
                        activeStep === index
                          ? "#5e72e4"
                          : activeStep > index
                          ? "#2dce89"
                          : "#e9ecef",
                      "& svg": {
                        fontSize: "1rem",
                        color: activeStep >= index ? "#fff" : "#8898aa",
                      },
                    }}
                  >
                    {step.icon}
                  </Avatar>
                )}
              >
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    color: activeStep === index ? "#32325d" : "#8898aa",
                  }}
                >
                  {step.label}
                </Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Show warning if only one member in group */}
        {users.length === 1 && (
          <Box sx={{ mt: 2, mb: 2, p: 2, background: '#fff3cd', borderRadius: 2, border: '1px solid #ffeeba', display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography color="#856404" fontWeight={600}>
              You need at least 2 members in a group to add an expense. Please add more members first.
            </Typography>
          </Box>
        )}

        {getStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          sx={{
            color: "#8898aa",
            "&:hover": { backgroundColor: "rgba(136, 152, 170, 0.1)" },
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
          disabled={loading || users.length === 1}
          sx={{
            bgcolor: "#5e72e4",
            "&:hover": { bgcolor: "#4454c3" },
            "&.Mui-disabled": { bgcolor: "rgba(94, 114, 228, 0.3)" },
          }}
        >
          {activeStep === steps.length - 1 ? "Add Expense" : "Next"}
          {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddExpenseModal;
