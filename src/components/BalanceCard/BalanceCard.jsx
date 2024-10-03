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
  Link,
} from "@mui/material";
import React, { useState } from "react";

import DoneOutlineIcon from "@mui/icons-material/DoneOutline";

function BalanceCard({ balances, groupId }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState([]);

  console.log(selectedBreakdown);

  const handleOpenModal = (breakdown) => {
    setSelectedBreakdown(breakdown);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBreakdown([]);
  };

  const handleSettleUp = async (balanceId, settleStatus) => {};

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
        <CardContent sx={{ padding: "0 !important" }}>
          <Typography variant="subtitle1" margin={2} sx={{ color: "#353E6C" }}>
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
                    View all transactions
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      backgroundColor: "#8675FF",
                      color: "white",
                      padding: "4px 16px",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balances?.map(
                  ({ id, debtor, creditor, amount, breakdown, isSettled }) => (
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
                          <Avatar
                            sx={{ marginRight: 1, width: 28, height: 28 }}
                          />
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
                          <Avatar
                            sx={{ marginRight: 1, width: 28, height: 28 }}
                          />
                          <Tooltip title={creditor?.name} placement="top" arrow>
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
                          label={`${amount} Rs`}
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
                      <TableCell>
                        {isSettled ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <DoneOutlineIcon color="success" />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              Settled
                            </Typography>
                            <Link
                              key={id}
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering other row actions
                                handleSettleUp(id, false); // Call the undo settle up function
                              }}
                            >
                              Undo
                            </Link>
                          </Box>
                        ) : (
                          <Button
                            key={id}
                            variant="outlined"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default action
                              e.stopPropagation(); // Prevent any parent row click actions
                              handleSettleUp(id, true); // Call the settle up function for the specific row
                            }}
                            sx={{
                              color: "green",
                              borderColor: "green",
                              borderRadius: 1,
                              padding: "2px 6px",
                              minWidth: "120px",
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                              "&:hover": {
                                backgroundColor: "#e3f2fd",
                              },
                            }}
                          >
                            Settle Up
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
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
                    <TableCell>{transaction.amount} Rs</TableCell>
                    <TableCell>
                      {new Date(transaction.createdDate).toLocaleDateString()}
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
