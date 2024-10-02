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
} from "@mui/material";
import React, { useState } from "react";

function BalanceCard({ balances }) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState([]);

  const handleOpenModal = (breakdown) => {
    setSelectedBreakdown(breakdown);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBreakdown([]);
  };

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
                      backgroundColor: "#8675FF", // Light gray background for a modern feel
                      color: "white", // Darker gray text for contrast
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
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balances.map(({ id, debtor, creditor, amount, breakdown }) => (
                  <TableRow
                    key={id}
                    sx={{
                      "&:hover": { backgroundColor: "#f5f5f5" },
                      backgroundColor: (index) =>
                        index % 2 === 0 ? "#fafafa" : "#ffffff", // Alternate row colors in light neutral tones
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
                          borderColor: "#8675FF", // Professional blue for the chip
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
                  </TableRow>
                ))}
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
                {selectedBreakdown.map((item, index) => (
                  <TableRow
                    key={index}
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                  >
                    <TableCell sx={{ padding: "8px" }}>
                      <Tooltip title={item.description} placement="top" arrow>
                        <Typography
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "120px",
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>

                    <TableCell sx={{ padding: "8px" }}>
                      <Tooltip title={item.owedBy?.name} placement="top" arrow>
                        <Typography
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "120px",
                          }}
                        >
                          {item.owedBy?.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ padding: "8px" }}>
                      <Tooltip title={item.paidBy?.name} placement="top" arrow>
                        <Typography
                          sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "120px",
                          }}
                        >
                          {item.paidBy?.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ padding: "8px" }}>
                      {item.amount} Rs
                    </TableCell>
                    <TableCell sx={{ padding: "8px" }}>
                      {new Date(item.createdDate).toLocaleDateString()}
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
