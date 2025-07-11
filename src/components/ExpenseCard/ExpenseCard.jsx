import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardContent,
  Typography,
  Grid,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import PersonIcon from "@mui/icons-material/Person";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";
import EditIcon from "@mui/icons-material/Edit";
import AddExpenseModal from "../AddExpense/AddExpenseModal";
import { formatTransactionDate, getCurrencySymbol } from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";
import GroupService from "../services/group.service";
import { useLinearProgress } from "../contexts/LinearProgress";
import { useAllGroups } from "../contexts/AllGroups";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import ActivityService from "../services/activity.service";
import { v4 as uuidv4 } from "uuid";

const TransactionCard = ({
  transaction,
  index,
  groupId,
  groupTitle,
  groupAdmin,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const dateShort = formatTransactionDate(transaction?.date);
  const { currentUser } = useCurrentUser();
  const colors = [
    "#4F46E5", // Indigo
    "#3B82F6", // Blue
    "#6366F1", // Violet
    "#8B5CF6", // Purple
  ];
  const { setLinearProgress } = useLinearProgress();
  const { refreshAllGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

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
        mb: { xs: 1, sm: 2 }, // Reduced margin for mobile
        borderRadius: "20px",
        background: "#E0E5EC",
        boxShadow:
          "9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)",
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow:
            "12px 12px 20px rgb(163,177,198,0.8), -12px -12px 20px rgba(255,255,255, 0.8)",
        },
      }}
    >
      <Accordion
        expanded={expanded}
        onChange={handleAccordionChange}
        elevation={0}
        sx={{
          background: "transparent",
          "&:before": {
            display: "none", // Remove the default accordion line
          },
          "& .MuiAccordionSummary-root": {
            borderRadius: "20px",
            transition: "all 0.3s ease",
            minHeight: { xs: "48px", sm: "56px" }, // Reduced height on mobile
            padding: { xs: "4px 12px", sm: "6px 16px" }, // Reduced padding on mobile
            "&:hover": {
              background: "rgba(255, 255, 255, 0.1)",
            },
          },
          "& .MuiAccordionDetails-root": {
            background: "linear-gradient(145deg, #e6e9ef, #f0f3f9)",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow:
              "inset 3px 3px 7px rgba(163,177,198,0.6), inset -3px -3px 7px rgba(255,255,255, 0.5)",
            padding: { xs: "8px", sm: "16px" }, // Reduced padding on mobile
            maxHeight: { xs: "60vh", sm: "70vh" }, // Limit max height
            overflow: "auto",
          },
          "& .Mui-expanded": {
            margin: "0 !important", // Remove default margin when expanded
          },
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMoreIcon
              sx={{
                color: colors[index % colors.length],
                transition: "transform 0.3s ease",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          }
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderBottom: expanded
              ? "1px solid rgba(226, 232, 240, 0.8)"
              : "none",
            minHeight: { xs: "48px", sm: "56px" }, // Reduced height on mobile
            padding: { xs: "4px 12px", sm: "6px 16px" }, // Reduced padding on mobile
          }}
        >
          <Box
            sx={{
              backgroundColor: colors[index % colors.length],
              width: { xs: 70, sm: 90 }, // Reduced width on mobile
              height: "100%",
              position: "absolute",
              left: 0,
              top: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              "&::after": {
                content: '""',
                position: "absolute",
                right: -15,
                top: "50%",
                transform: "translateY(-50%)",
                borderLeft: `15px solid ${colors[index % colors.length]}`,
                borderTop: "15px solid transparent",
                borderBottom: "15px solid transparent",
              },
            }}
          >
            <Typography
              sx={{
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.75rem", sm: "0.9rem" },
              }}
            >
              {dateShort?.month}
            </Typography>
            <Typography
              sx={{
                color: "white",
                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                fontWeight: 700,
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
              marginLeft: { xs: 10, sm: 14 },
              alignItems: "center",
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Typography
              sx={{
                color: "#1E293B",
                fontSize: { xs: "0.8rem", sm: "1rem" },
                fontWeight: 600,
                flexGrow: 1,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: { xs: 1.2, sm: 1.4 },
              }}
            >
              {transaction?.description}
            </Typography>
            <Typography
              sx={{
                color: colors[index % colors.length],
                fontSize: { xs: "1rem", sm: "1.25rem" },
                fontWeight: 700,
                display: "flex",
                alignItems: "baseline",
                gap: 0.5,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {transaction.amount}
              <span
                style={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  opacity: 0.9,
                }}
              >
                {getCurrencySymbol(transaction?.currency)}
              </span>
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <TableContainer
            sx={{
              borderRadius: "8px",
              border: "1px solid rgba(224, 224, 224, 1)",
              overflow: "hidden",
              "& .MuiTableCell-root": {
                border: "1px solid rgba(224, 224, 224, 1)",
                borderCollapse: "collapse",
                padding: { xs: "6px 8px", sm: "8px 16px" },
              },
              "& .MuiTable-root": {
                borderCollapse: "separate",
                borderSpacing: 0,
                "& td, & th": {
                  border: "1px solid rgba(224, 224, 224, 1)",
                },
              },
            }}
          >
            <Table
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": {
                  padding: { xs: "6px 8px", sm: "8px 16px" },
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                  borderColor: "#E9ECEF",
                  height: { xs: "auto", sm: "48px" },
                  minHeight: { xs: "36px", sm: "48px" },
                  overflowWrap: "break-word",
                  wordWrap: "break-word",
                  hyphens: "auto",
                },
                "& .MuiChip-root": {
                  height: { xs: "24px", sm: "32px" },
                  "& .MuiChip-label": {
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                    padding: { xs: "0 6px", sm: "0 12px" },
                  },
                },
                "& .MuiTableCell-head": {
                  backgroundColor: "#F8FAFC",
                  fontWeight: 600,
                },
                "& tr:last-child td": {
                  borderBottom: "none",
                },
                "& tr td:first-of-type": {
                  width: { xs: "40%", sm: "30%" },
                  backgroundColor: "#F8FAFC",
                  borderRight: "1px solid #E9ECEF",
                  position: "sticky",
                  left: 0,
                },
                "& tr td:last-child": {
                  width: { xs: "60%", sm: "70%" },
                },
                "& .split-between-box": {
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.5,
                  maxHeight: { xs: "none", sm: "80px" },
                  "& .MuiChip-root": {
                    margin: "2px",
                    flexGrow: 0,
                    flexShrink: 0,
                  },
                },
              }}
            >
              <TableBody>
                {[
                  {
                    id: "description",
                    label: "Title",
                    icon: (
                      <DescriptionIcon
                        sx={{ color: colors[index % colors.length] }}
                      />
                    ),
                    content: (
                      <Typography sx={{ fontWeight: 500 }}>
                        {transaction.description}
                      </Typography>
                    ),
                  },
                  {
                    id: "paidBy",
                    label: "Paid by",
                    icon: (
                      <ReceiptIcon
                        sx={{ color: colors[index % colors.length] }}
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
                          label={transaction?.paidBy?.name}
                          sx={{
                            backgroundColor: `${
                              colors[index % colors.length]
                            }15`,
                            color: colors[index % colors.length],
                            fontWeight: 500,
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
                        sx={{ color: colors[index % colors.length] }}
                      />
                    ),
                    content: (
                      <Chip
                        label={new Date(transaction.date).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    ),
                  },
                  {
                    id: "amount",
                    label: "Spent Amount",
                    icon: (
                      <MonetizationOnIcon
                        sx={{ color: colors[index % colors.length] }}
                      />
                    ),
                    content: `${transaction.amount} ${getCurrencySymbol(
                      transaction?.currency
                    )}`,
                  },
                  {
                    id: "splitBetween",
                    label: "Split Between",
                    icon: (
                      <AltRouteIcon
                        sx={{ color: colors[index % colors.length] }}
                      />
                    ),
                    content: (
                      <Box className="split-between-box">
                        {transaction.splitBetween?.map((item, idx) => (
                          <Chip
                            key={idx}
                            label={item?.name}
                            sx={{
                              backgroundColor: `${
                                colors[index % colors.length]
                              }15`,
                              color: colors[index % colors.length],
                              fontWeight: 600,
                              borderRadius: "6px",
                            }}
                          />
                        ))}
                      </Box>
                    ),
                  },
                  {
                    id: "createdBy",
                    label: "Expense added by",
                    icon: (
                      <PersonIcon
                        sx={{ color: colors[index % colors.length] }}
                      />
                    ),
                    content: (
                      <Chip
                        key={transaction?.createdBy?.name}
                        label={transaction?.createdBy?.name}
                        sx={{
                          backgroundColor: `${colors[index % colors.length]}15`,
                          color: colors[index % colors.length],
                          fontWeight: 600,
                          borderRadius: "6px",
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
                              sx={{ color: colors[index % colors.length] }}
                            />
                          ),
                          content: (
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton
                                onClick={handleEditClick}
                                size="small"
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
                                  color: "#f5365c",
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
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        fontWeight: 500,
                        color: "#2D3748",
                      }}
                    >
                      {row.icon}
                      {row.label}
                    </TableCell>
                    <TableCell>{row.content}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

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

export default TransactionCard;
