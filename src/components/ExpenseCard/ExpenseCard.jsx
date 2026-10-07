import React, { useEffect, useState } from "react";
import {
  CardContent,
  Typography,
  Grid,
  Avatar,
  IconButton,
  Box,
  Chip,
  TableContainer,
  TableBody,
  Table,
  TableCell,
  TableRow,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import AddExpenseModal from "../AddExpense/AddExpenseModal";
import { formatTransactionDate, formatCurrency, formatDisplayName } from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";
import GroupService from "../services/group.service";
import { useLinearProgress } from "../contexts/LinearProgress";
import { useAllGroups } from "../contexts/AllGroups";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import ActivityService from "../services/activity.service";
import { v4 as uuidv4 } from "uuid";
import ProfileAvatar from "../ProfileAvatar/ProfileAvatar";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { useScreenSize } from "../contexts/ScreenSizeContext";

export const ExpenseCard = ({
  transaction,
  index,
  groupId,
  groupTitle,
  groupAdmin,
  autoOpen = false,
  autoOpenRequestId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dateShort = formatTransactionDate(transaction?.date);
  const { currentUser } = useCurrentUser();
  const description = transaction?.description || "Untitled expense";
  const expenseDate = (() => {
    const value = transaction?.date;
    if (!value) return "Date unavailable";
    const parsedDate =
      typeof value?.toDate === "function"
        ? value.toDate()
        : value?.seconds != null
          ? new Date(value.seconds * 1000)
          : new Date(value);
    return Number.isNaN(parsedDate.getTime())
      ? "Date unavailable"
      : parsedDate.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  })();
  const payerName = formatDisplayName(
    transaction?.paidBy?.name || transaction?.paidBy?.email || "Unknown payer"
  );
  const participantCount =
    (transaction?.splitBetween?.length || 0) +
    (transaction?.excludePayer ? 0 : 1);
  const colors = [
    "#4F46E5", // Indigo
    "#3B82F6", // Blue
    "#6366F1", // Violet
    "#8B5CF6", // Purple
  ];
  const { setLinearProgress } = useLinearProgress();
  const { refreshAllGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();
  const isMobile = useScreenSize();

  useEffect(() => {
    if (autoOpen) setExpanded(true);
  }, [autoOpen, autoOpenRequestId]);

  const handleDeleteExpense = async () => {
    try {
      setLinearProgress(true);
      await GroupService.removeExpenseFromGroup(groupId, transaction?.id);

      const log = {
        logId: uuidv4(),
        logType: "deleteExpense",
        details: {
          expenseTitle: transaction?.description,
          performedBy: {
            email: currentUser?.email,
            name: currentUser.name,
          },
          date: new Date(),
          groupTitle: groupTitle,
          groupId: groupId,
          amount: transaction?.amount,
          currency: transaction?.currency,
        },
      };

      await ActivityService.addActivityLog(log);

      setSnackBar({ isOpen: true, message: "Expense deleted" });
      refreshAllGroups();
    } catch (err) {
      console.warn("Error removing expense: " + err.message);
    } finally {
      setLinearProgress(false);
      setOpenConfirmDialog(false);
    }
  };

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    setEditModalOpen(true);
  };

  return (
    <Box
      sx={{
        mb: { xs: 0.75, sm: 1 },
        borderRadius: "12px",
        background: "#fff",
        border: "1px solid rgba(50, 50, 93, 0.12)",
        boxShadow: "0 1px 4px rgba(50, 50, 93, 0.05)",
        position: "relative",
        overflow: "visible",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "rgba(94, 114, 228, 0.35)",
          boxShadow: "0 3px 10px rgba(50, 50, 93, 0.09)",
        },
      }}
    >
      <Box
        sx={{
          borderRadius: "12px",
          overflow: "visible",
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`View details for ${transaction?.description || "expense"}`}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "40px minmax(0, 1fr)",
              sm: "44px minmax(0, 1fr)",
            },
            alignItems: "center",
            gap: { xs: 1, sm: 1.5 },
            width: "100%",
            backgroundColor: "#fff",
            border: 0,
            borderRadius: "12px",
            minHeight: { xs: 64, sm: 72 },
            padding: { xs: "8px 10px", sm: "10px 12px" },
            textAlign: "left",
            cursor: "pointer",
            font: "inherit",
            transition: "background-color 0.2s ease",
            "&:hover": { backgroundColor: "#fbfcff" },
            "&:focus-visible": {
              outline: "3px solid rgba(94, 114, 228, 0.55)",
              outlineOffset: 2,
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: "#eef1ff",
              color: "#4f5fc7",
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                color: "inherit",
                fontWeight: 600,
                fontSize: { xs: "0.65rem", sm: "0.7rem" },
              }}
            >
              {dateShort?.month}
            </Typography>
            <Typography
              sx={{
                color: "inherit",
                fontSize: { xs: "1.05rem", sm: "1.15rem" },
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {dateShort?.day}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexGrow: 1,
              alignItems: "center",
              minWidth: 0,
              gap: { xs: 0.75, sm: 2 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.4,
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Typography
                sx={{
                  color: "#1E293B",
                  fontSize: { xs: "0.82rem", sm: "0.9rem" },
                  fontWeight: 650,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.25,
                }}
              >
                {description.charAt(0).toUpperCase() + description.slice(1)}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr)",
                  alignItems: "center",
                  gap: 0.5,
                  minWidth: 0,
                }}
              >
                <ProfileAvatar
                  user={transaction?.paidBy}
                  alt={payerName}
                  sx={{
                    width: 16,
                    height: 16,
                    border: "1px solid white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                    flexShrink: 0,
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748B",
                    fontSize: { xs: "0.68rem", sm: "0.72rem" },
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    minWidth: 0,
                  }}
                >
                  Paid by {payerName} · {participantCount} {participantCount === 1 ? "person" : "people"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.4, sm: 1 }, flexShrink: 0 }}>
              <Typography
                sx={{
                  color: "#263449",
                  fontSize: { xs: "0.82rem", sm: "1rem" },
                  fontWeight: 700,
                  display: "block",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {formatCurrency(transaction.amount, transaction?.currency)}
              </Typography>
              <OpenInFullIcon sx={{ fontSize: { xs: 15, sm: 17 }, color: "#64748b" }} aria-hidden="true" />
            </Box>
          </Box>
        </Box>

        <Dialog
          open={expanded}
          onClose={() => setExpanded(false)}
          fullScreen={isMobile}
          fullWidth
          maxWidth="md"
          aria-labelledby={`expense-detail-title-${transaction?.id || index}`}
          PaperProps={{
            sx: {
              borderRadius: { xs: 0, sm: 3 },
              maxHeight: { sm: "90vh" },
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(15, 23, 42, 0.2)",
            },
          }}
        >
          <DialogTitle
            component="div"
            id={`expense-detail-title-${transaction?.id || index}`}
            sx={{ p: 0 }}
          >
            <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="overline" sx={{ color: "#5e72e4", fontWeight: 700, lineHeight: 1.4 }}>
                    Expense details
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ color: "#1e293b", fontWeight: 700, lineHeight: 1.25, overflowWrap: "anywhere" }}
                  >
                    {description}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
                    <ProfileAvatar user={transaction?.paidBy} alt={payerName} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                      Paid by {payerName}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={() => setExpanded(false)}
                  aria-label="Close expense details"
                  size="small"
                  sx={{ color: "#64748b", flexShrink: 0, mt: 0.25 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: { xs: 1.5, sm: 2.5 }, overflow: "auto", backgroundColor: "#f8fafc" }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "#334155", fontWeight: 700 }}>
            Expense breakdown
          </Typography>
          <TableContainer
            sx={{
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
          >
            <Table
              sx={{
                tableLayout: "fixed",
                width: "100%",
                borderCollapse: "collapse",
                "& .MuiTableCell-root": {
                  boxSizing: "border-box",
                  px: { xs: 1, sm: 1.75 },
                  py: { xs: 1, sm: 1.25 },
                  fontSize: { xs: "0.78rem", sm: "0.85rem" },
                  borderColor: "#e8edf3",
                  verticalAlign: "middle",
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  hyphens: "auto",
                },
                "& .MuiChip-root": {
                  height: { xs: 28, sm: 32 },
                  maxWidth: "100%",
                  "& .MuiChip-label": {
                    fontSize: { xs: "0.68rem", sm: "0.75rem" },
                    px: { xs: 0.75, sm: 1 },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },
                },
                "& tr:last-child > *": {
                  borderBottom: "none",
                },
                "& tr > :first-child": {
                  width: { xs: "38%", sm: "32%" },
                  backgroundColor: "#f8fafc",
                  borderRight: "1px solid #edf1f5",
                },
                "& tr > :last-child": {
                  width: { xs: "62%", sm: "68%" },
                },
                "& .split-between-box": {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.75,
                  "& .MuiChip-root": {
                    flexGrow: 0,
                    flexShrink: 0,
                  },
                },
              }}
            >
              <TableBody>
                {[
                  {
                    id: "paidBy",
                    label: "Paid by",
                    icon: (
                      <ReceiptIcon
                        sx={{ color: "#64748b" }}
                      />
                    ),
                    content: (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          alignItems: { xs: "flex-start", sm: "center" },
                          gap: 1.5,
                        }}
                      >
                        <Chip
                          avatar={
                            <ProfileAvatar
                              user={transaction?.paidBy}
                              name={payerName}
                              alt={payerName}
                              sx={{ width: 24, height: 24 }}
                            />
                          }
                          label={payerName}
                          sx={{
                            backgroundColor: "#eef1ff",
                            color: "#4f5fc7",
                            fontWeight: 500,
                            border: "1px solid #e0e5ff",
                          }}
                        />
                        <Chip
                          label={
                            !transaction.excludePayer
                              ? "Included in split"
                              : "Not included in split"
                          }
                          size="small"
                          color={
                            !transaction.excludePayer ? "success" : "error"
                          }
                          variant="outlined"
                          sx={{
                            height: "24px",
                            fontSize: "0.75rem",
                            display: "flex",
                          }}
                        />
                      </Box>
                    ),
                  },
                  {
                    id: "date",
                    label: "Payment Date",
                    icon: (
                      <AccessTimeIcon
                        sx={{ color: "#64748b" }}
                      />
                    ),
                    content: (
                      <Chip
                        label={expenseDate}
                        size="small"
                        sx={{ color: "#334155", backgroundColor: "#f8fafc", fontWeight: 500 }}
                      />
                    ),
                  },
                  {
                    id: "amount",
                    label: "Total spent",
                    icon: <MonetizationOnIcon sx={{ color: "#64748b" }} />,
                    content: (
                      <Typography sx={{ color: "#27356d", fontWeight: 700 }}>
                        {formatCurrency(transaction.amount, transaction?.currency)}
                      </Typography>
                    ),
                  },
                  {
                    id: "splitBetween",
                    label: "Split Between",
                    icon: (
                      <AltRouteIcon
                        sx={{ color: "#64748b" }}
                      />
                    ),
                    content: (
                      <Box className="split-between-box">
                        {transaction.splitBetween?.length ? transaction.splitBetween.map((item, idx) => (
                          <Chip
                            key={item?.email || `${item?.name || "member"}-${idx}`}
                            size="small"
                            avatar={
                              <ProfileAvatar
                                user={item}
                                name={item?.name || item?.email}
                                alt={item?.name || item?.email}
                                sx={{ width: 24, height: 24 }}
                              />
                            }
                            label={formatDisplayName(item?.name || item?.email)}
                            sx={{
                              backgroundColor: "#fff",
                              color: "#334155",
                              fontWeight: 600,
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                            }}
                          />
                        )) : (
                          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                            No participants listed
                          </Typography>
                        )}
                      </Box>
                    ),
                  },
                  {
                    id: "createdBy",
                    label: "Expense added by",
                    icon: (
                      <PersonIcon
                        sx={{ color: "#64748b" }}
                      />
                    ),
                    content: (
                      <Chip
                        key={transaction?.createdBy?.name}
                        size="small"
                        avatar={
                          <ProfileAvatar
                            user={transaction?.createdBy}
                            name={transaction?.createdBy?.name || transaction?.createdBy?.email || "Unknown"}
                            alt={transaction?.createdBy?.name || transaction?.createdBy?.email || "Unknown"}
                            sx={{ width: 24, height: 24 }}
                          />
                        }
                        label={formatDisplayName(transaction?.createdBy?.name || transaction?.createdBy?.email || "Unknown")}
                        sx={{
                          backgroundColor: "#fff",
                          color: "#334155",
                          fontWeight: 600,
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                    ),
                  },
                  ...(transaction?.createdBy?.email === currentUser?.email ||
                  groupAdmin === currentUser?.email
                    ? [
                        {
                          id: "actions",
                          label: "Actions",
                          icon: (
                            <SettingsIcon
                              sx={{ color: "#64748b" }}
                            />
                          ),
                          content: (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                onClick={handleEditClick}
                                size="small"
                                aria-label="Edit expense"
                                sx={{
                                  color: "#5e72e4",
                                  "&:hover": {
                                    backgroundColor: "rgba(94, 114, 228, 0.1)",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                color="error"
                                aria-label="delete"
                                onClick={handleOpenConfirmDialog}
                                size="small"
                                sx={{
                                  color: "#e05260",
                                  "&:hover": {
                                    backgroundColor: "rgba(245, 54, 92, 0.1)",
                                  },
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          ),
                        },
                      ]
                    : []),
                ].map((row) => (
                  <TableRow key={row.id}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ fontWeight: 600, color: "#475569" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            borderRadius: 1,
                            color: "#5e72e4",
                            backgroundColor: "#eef1ff",
                            "& svg": { fontSize: 17, color: "inherit" },
                          }}
                        >
                          {row.icon}
                        </Box>
                        <Typography component="span" sx={{ fontSize: "inherit", fontWeight: "inherit", lineHeight: 1.25 }}>
                          {row.label}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{row.content}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          </DialogContent>
        </Dialog>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: "#E0E5EC",
            boxShadow:
              "9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)",
          },
        }}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <DialogTitle id="confirm-dialog-title">Delete Expense</DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description">
            Are you sure you want to delete this expense? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteExpense} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <AddExpenseModal
        open={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
        isEditing={true}
        expenseToEdit={transaction}
      />
    </Box>
  );
};

