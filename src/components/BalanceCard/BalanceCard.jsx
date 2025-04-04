import {
  Avatar,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Alert,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import React, { useState } from "react";
import GradingIcon from "@mui/icons-material/Grading";
import { formatIsoDate, getCurrencySymbol } from "../utils";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import { useCurrentUser } from "../contexts/CurrentUser";

function BalanceCard({ balances }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState([]);
  const [showRelatedToMe, setShowRelatedToMe] = useState(true);
  const { currentCurrency } = useCurrentCurrency();
  const { currentUser } = useCurrentUser();

  const handleOpenModal = (breakdown) => {
    setSelectedBreakdown(breakdown);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBreakdown([]);
  };

  const filteredBalances = showRelatedToMe
    ? balances.filter(
        (balance) =>
          balance.debtor?.name === currentUser.name ||
          balance.creditor?.name === currentUser.name
      )
    : balances;

  return (
    <>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
          width: "100%",
          overflow: "hidden",
          fontFamily: "Poppins, sans-serif",
          boxShadow: 2,
        }}
      >
        {balances?.length > 0 ? (
          <CardContent sx={{ padding: "0 !important" }}>
            <Alert severity="info">
              Currency conversion rates may vary; results are approximate.
            </Alert>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={showRelatedToMe}
                  onChange={(e) => setShowRelatedToMe(e.target.checked)}
                  color="secondary"
                />
              }
              label="View Balances Involving Me"
              sx={{
                ml: 1,
                mt: 1,
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.9rem", // Adjust the font size as desired
                },
              }}
            />
            <Typography
              variant="subtitle1"
              margin={2}
              sx={{ color: "#353E6C" }}
            >
              Balance summary
            </Typography>
            <TableContainer>
              <Table aria-label="balance table">
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#8675FF",
                        color: "white",
                        padding: "4px 16px",
                      }}
                    >
                      Will Give
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#8675FF",
                        color: "white",
                        padding: "4px 16px",
                      }}
                    >
                      Will Receive
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#8675FF",
                        color: "white",
                        padding: "4px 16px",
                      }}
                    >
                      Amount
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#8675FF",
                        color: "white",
                        padding: "4px 16px",
                      }}
                    >
                      Currency
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        backgroundColor: "#8675FF",
                        color: "white",
                        padding: "4px 16px",
                      }}
                    >
                      View all transactions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBalances?.map(
                    ({ id, debtor, creditor, amount, breakdown, currency }) => (
                      <TableRow
                        key={id}
                        sx={{
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          backgroundColor: (index) =>
                            index % 2 === 0 ? "#fafafa" : "#ffffff",
                        }}
                      >
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Tooltip title={debtor?.name} placement="top" arrow>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "160px",
                                }}
                              >
                                {debtor?.name}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Tooltip
                              title={creditor?.name}
                              placement="top"
                              arrow
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "160px",
                                }}
                              >
                                {creditor?.name}
                              </Typography>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${amount} ${getCurrencySymbol(currency)}`}
                            variant="outlined"
                            sx={{
                              fontSize: "0.85rem",
                              fontWeight: "bold",
                              borderColor: "#8675FF",
                              color: "#8675FF",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Tooltip
                              title={currentCurrency}
                              placement="top"
                              arrow
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxWidth: "160px",
                                }}
                              >
                                ({currentCurrency})
                              </Typography>
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            onClick={() => handleOpenModal(breakdown)}
                            sx={{
                              color: "#8675FF",
                              borderColor: "#8675FF",
                              borderRadius: 20,
                              padding: "4px 10px",
                              minWidth: "120px",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              "&:hover": {
                                backgroundColor: "#e3f2fd",
                              },
                            }}
                          >
                            View Breakdown
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", pl: 2 }}>
            <GradingIcon fontSize="large" color="success" />
            <Typography
              variant="subtitle1"
              margin={2}
              sx={{ color: "#353E6C" }}
            >
              All balances are Settled
            </Typography>
          </Box>
        )}
      </Card>

      {/* Breakdown Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Transaction Breakdown</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table aria-label="breakdown table">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#8675FF",
                      color: "#ffffff",
                      padding: "4px 16px",
                    }}
                  >
                    Expense
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#8675FF",
                      color: "#ffffff",
                      padding: "4px 16px",
                    }}
                  >
                    Owed By
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#8675FF",
                      color: "#ffffff",
                      padding: "4px 16px",
                    }}
                  >
                    Paid By
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#8675FF",
                      color: "#ffffff",
                      padding: "4px 16px",
                    }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#8675FF",
                      color: "#ffffff",
                      padding: "4px 16px",
                    }}
                  >
                    Date
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedBreakdown?.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.owedBy?.name}</TableCell>
                    <TableCell>{transaction.paidBy?.name}</TableCell>
                    <TableCell>
                      {transaction.amount}{" "}
                      {getCurrencySymbol(transaction.currency)}
                    </TableCell>
                    <TableCell>
                      {formatIsoDate(transaction.createdDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BalanceCard;
