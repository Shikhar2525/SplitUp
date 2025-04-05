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

  return (
    <>
      <Accordion
        sx={{
          marginBottom: 1.5, // Reduced from 2.5
          borderRadius: "12px",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFF 100%)",
          boxShadow: "0 4px 18px 0px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          },
          "&.Mui-expanded": {
            margin: "0 0 1.5rem 0",
          },
        }}
        expanded={expanded}
        onChange={handleAccordionChange}
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
            minHeight: "56px", // Reduced from 72
            padding: "8px 16px", // Reduced padding
          }}
        >
          <Box
            sx={{
              backgroundColor: colors[index % colors.length],
              width: 90,
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
            <Typography sx={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>
              {dateShort?.month}
            </Typography>
            <Typography sx={{ color: "white", fontSize: "1.5rem", fontWeight: 700 }}>
              {dateShort?.day}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexGrow: 1,
              marginLeft: 14,
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                color: "#1E293B",
                fontSize: "1rem",
                fontWeight: 600,
                flexGrow: 1,
              }}
            >
              {transaction?.description}
            </Typography>
            <Typography
              sx={{
                color: colors[index % colors.length],
                fontSize: "1.25rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "baseline",
                gap: 0.5,
              }}
            >
              {transaction.amount}
              <span style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                {getCurrencySymbol(transaction?.currency)}
              </span>
            </Typography>
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ padding: "8px 12px" }}>
          <TableContainer
            sx={{
              borderRadius: "8px",
              border: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Table
              sx={{
                tableLayout: "fixed",
                "& .MuiTableCell-root": {
                  padding: "8px 12px", // Reduced padding
                  fontSize: "0.85rem",
                  borderColor: "#E9ECEF",
                  height: "48px", // Fixed height for all cells
                  minHeight: "48px",
                  maxHeight: "48px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "& .MuiChip-root": {
                  height: "28px", // Smaller chip height
                  padding: "0 8px", // Reduced chip padding
                  "& .MuiChip-label": {
                    padding: "0 6px", // Reduced label padding
                    fontSize: "0.8rem",
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
                  width: "30%",
                  backgroundColor: "#F8FAFC",
                  borderRight: "1px solid #E9ECEF",
                },
                "& tr td:last-child": {
                  width: "70%",
                },
              }}
            >
              <TableBody>
                {[
                  {
                    id: "description",
                    label: "Description",
                    icon: null,
                    content: (
                      <Typography sx={{ fontWeight: 500 }}>
                        {transaction.description}
                      </Typography>
                    ),
                  },
                  {
                    id: "paidBy",
                    label: "Transaction done by",
                    icon: <ReceiptIcon sx={{ color: colors[index % colors.length] }} />,
                    content: (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Chip
                          label={transaction?.paidBy?.name}
                          sx={{
                            backgroundColor: `${colors[index % colors.length]}15`,
                            color: colors[index % colors.length],
                            fontWeight: 500,
                          }}
                        />
                        <Chip
                          label={!transaction.excludePayer ? "Included in split" : "Not included in split"}
                          size="small"
                          color={!transaction.excludePayer ? "success" : "error"}
                          variant="outlined"
                          sx={{
                            height: "24px",
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                    ),
                  },
                  {
                    id: "date",
                    label: "Transaction Date",
                    icon: <AccessTimeIcon sx={{ color: colors[index % colors.length] }} />,
                    content: (
                      <Chip
                        label={new Date(transaction.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    ),
                  },
                  {
                    id: "amount",
                    label: "Spent Amount",
                    icon: <MonetizationOnIcon sx={{ color: colors[index % colors.length] }} />,
                    content: `${transaction.amount} ${getCurrencySymbol(transaction?.currency)}`,
                  },
                  {
                    id: "splitBetween",
                    label: "Split Between",
                    icon: <AltRouteIcon sx={{ color: colors[index % colors.length] }} />,
                    content: (
                      <Box>
                        {transaction.splitBetween?.map((item) => (
                          <Chip
                            key={item?.name}
                            label={item?.name}
                            sx={{
                              margin: "0.2rem",
                              backgroundColor: `${colors[index % colors.length]}15`,
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
                    icon: <PersonIcon sx={{ color: colors[index % colors.length] }} />,
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
                {(transaction?.createdBy?.email === currentUser?.email ||
                  groupAdmin === currentUser?.email) && (
                  <TableRow>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        padding: "8px",
                        borderRight: "1px solid rgba(224, 224, 224, 1)",
                      }}
                    >
                      Actions:
                    </TableCell>
                    <TableCell sx={{ padding: "8px" }}>
                      <Grid container spacing={1}>
                        <Grid item>
                          <IconButton
                            color="error"
                            aria-label="delete"
                            onClick={handleOpenConfirmDialog}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={handleCloseConfirmDialog}
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
    </>
  );
};

export default TransactionCard;
