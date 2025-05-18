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
  Switch,
  Paper
} from "@mui/material";
import React, { useState } from "react";
import GradingIcon from "@mui/icons-material/Grading";
import InfoIcon from "@mui/icons-material/Info";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { motion, AnimatePresence } from "framer-motion";
import { formatIsoDate, getCurrencySymbol } from "../utils";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import { useCurrentUser } from "../contexts/CurrentUser";

function BalanceCard({ balances, isSimplified, onSimplifiedChange }) {
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
        }}
      >
        {balances?.length > 0 ? (
          <CardContent sx={{ padding: "0 !important" }}>
            <Alert severity="info">
              Currency conversion rates may vary; results are approximate.
            </Alert>
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              px: 2, 
              mt: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 2 }
            }}>
              {/* View Balances Checkbox - Shown first on mobile */}
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
                  "& .MuiFormControlLabel-label": {
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                  width: { xs: '100%', sm: 'auto' },
                  order: { xs: 1, sm: 1 }
                }}
              />

              {/* Split Mode Toggle - Now aligned right on mobile */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: { xs: 3, sm: 2 },
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 2, sm: 2 },
                justifyContent: { xs: 'flex-start', sm: 'flex-start' },
                borderBottom: { xs: '1px solid rgba(94, 114, 228, 0.1)', sm: 'none' },
                paddingBottom: { xs: 2, sm: 0 }
              }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    whiteSpace: 'nowrap',
                    color: '#525f7f'
                  }}
                >
                  Split Mode:
                </Typography>
                <Tooltip
                  title={
                    isSimplified
                      ? "Advanced mode minimizes the number of transactions needed to settle all debts"
                      : "Normal mode shows all individual transactions between members"
                  }
                  placement="top"
                  arrow
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isSimplified}
                        onChange={(e) => onSimplifiedChange(e.target.checked)}
                        color="primary"
                        sx={{
                          ml: { xs: 0, sm: 1 },
                          width: 42,
                          height: 26,
                          padding: 0,
                          '& .MuiSwitch-switchBase': {
                            padding: 0,
                            margin: '2px',
                            '&.Mui-checked': {
                              transform: 'translateX(16px)',
                              '& + .MuiSwitch-track': {
                                backgroundColor: 'rgba(94, 114, 228, 0.8) !important',
                                opacity: 1,
                                border: 0,
                              },
                              '& .MuiSwitch-thumb': {
                                backgroundColor: '#5e72e4',
                                '&::before': {
                                  content: '"⚡"',
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  top: 0,
                                  left: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                }
                              },
                            },
                          },
                          '& .MuiSwitch-thumb': {
                            boxSizing: 'border-box',
                            width: 22,
                            height: 22,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              left: 0,
                              top: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }
                          },
                          '& .MuiSwitch-track': {
                            borderRadius: 26 / 2,
                            backgroundColor: 'rgba(0,0,0,0.1) !important',
                            opacity: 1,
                            transition: 'background-color 0.2s',
                          },
                        }}
                      />
                    }
                    label={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5,
                        ml: 1,
                        color: isSimplified ? '#5e72e4' : 'inherit',
                        fontWeight: isSimplified ? 600 : 400,
                        transition: 'all 0.2s',
                        fontSize: { xs: '0.8rem', sm: '0.9rem' }
                      }}>
                        {isSimplified ? "Advanced" : "Normal"}
                        {isSimplified && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 260,
                              damping: 20
                            }}
                          >
                            <AutoAwesomeIcon 
                              sx={{ 
                                fontSize: { xs: '0.8rem', sm: '1rem' },
                                color: '#5e72e4',
                                filter: 'drop-shadow(0 0 2px rgba(94, 114, 228, 0.3))'
                              }} 
                            />
                          </motion.div>
                        )}
                      </Box>
                    }
                    sx={{
                      marginRight: 0,
                      marginLeft: 0
                    }}
                  />
                </Tooltip>
              </Box>
            </Box>
            {filteredBalances.length > 0 ? (
              <>
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
                        ({ id, debtor, creditor, amount, breakdown, currency }, index) => (
                          <TableRow
                            key={id}
                            sx={{
                              "&:hover": { backgroundColor: "#f5f5f5" },
                              backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
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
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <InfoIcon sx={{ fontSize: 40, color: "#8675FF", mb: 2 }} />
                <Typography variant="h6" sx={{ color: "#353E6C", mb: 1 }}>
                  No balances found
                </Typography>
                {showRelatedToMe && (
                  <Typography variant="body2" color="text.secondary">
                    Try unchecking "View Balances Involving Me" above to see all
                    balances in the group
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", pl: 2 }}>
            <GradingIcon fontSize="large" color="success" />
            <Typography variant="subtitle1" margin={2} sx={{ color: "#353E6C" }}>
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
