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
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import PersonIcon from "@mui/icons-material/Person";
import { formatTransactionDate } from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";
import GroupService from "../services/group.service"; // Import your GroupService
import { useLinearProgress } from "../contexts/LinearProgress";
import { useAllGroups } from "../contexts/AllGroups";
import { useTopSnackBar } from "../contexts/TopSnackBar";
import ActivityService from "../services/activity.service";
import { v4 as uuidv4 } from "uuid";

const TransactionCard = ({ transaction, index, groupId, groupTitle }) => {
  const [expanded, setExpanded] = useState(false);
  const dateShort = formatTransactionDate(transaction?.date);
  const { currentUser } = useCurrentUser();
  const colors = ["#FFBB38", "#F44771", "#332A7C", "#16DBCC"];
  const { setLinearProgress } = useLinearProgress();
  const { refreshAllGroups } = useAllGroups();
  const { setSnackBar } = useTopSnackBar();

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

  console.log("transaction", transaction);

  const handleDeleteExpense = async () => {
    try {
      setLinearProgress(true);
      await GroupService.removeExpenseFromGroup(groupId, transaction?.id);

      const log = {
        logId: uuidv4(),
        logType: "deleteExpense",
        details: {
          expenseTitle: transaction?.description,
          performedBy: currentUser?.email,
          date: new Date(),
          groupTitle: groupTitle,
          groupId: groupId,
          amount: transaction?.amount,
        },
      };
      await ActivityService.addActivityLog(log);

      setSnackBar({ isOpen: true, message: "Expense deleted" });
      refreshAllGroups();
    } catch (err) {
      console.warn("Error removing expense: " + err.message);
    } finally {
      setLinearProgress(false);
    }
  };

  return (
    <Accordion
      sx={{
        marginBottom: 1.5,
        borderRadius: 2,
        boxShadow: 3,
        width: "100%",
        fontFamily: "Poppins, sans-serif",
      }}
      expanded={expanded}
      onChange={handleAccordionChange}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 0,
        }}
      >
        <Box
          sx={{
            backgroundColor: colors[index % colors.length],
            height: "100%",
            width: 50,
            position: "absolute",
            left: 0,
            top: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="subtitle1"
            component="div"
            sx={{ color: "white" }}
          >
            {dateShort?.month}
          </Typography>
          <Typography
            variant="subtitle2"
            component="div"
            sx={{ color: "white" }}
          >
            {dateShort?.day}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            flexGrow: 1,
            marginLeft: 8,
          }}
        >
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
            sx={{
              flexGrow: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginRight: 2,
            }}
          >
            {transaction?.description}
          </Typography>
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#353E6C",
              minWidth: "80px",
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {transaction.amount} Rs
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <CardContent sx={{ padding: "0 !important" }}>
          <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
            <Table
              aria-label="transaction details table"
              size="small"
              sx={{ border: "1px solid rgba(224, 224, 224, 1)" }}
            >
              <TableBody>
                <TableRow
                  sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      padding: "8px",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    Description
                  </TableCell>
                  <TableCell sx={{ padding: "8px", paddingLeft: 2.2 }}>
                    {transaction.description}
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      padding: "8px",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    <ReceiptIcon sx={{ marginRight: 1 }} />
                    Transaction done by
                  </TableCell>
                  <TableCell sx={{ padding: "8px" }}>
                    <Chip
                      key={transaction?.paidBy?.name}
                      label={transaction?.paidBy?.name}
                    />
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      padding: "8px",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    <AccessTimeIcon sx={{ marginRight: 1 }} />
                    Transaction Date
                  </TableCell>
                  <TableCell sx={{ padding: "8px" }}>
                    <Chip
                      label={new Date(transaction.date).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      padding: "8px",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    <MonetizationOnIcon sx={{ marginRight: 1 }} />
                    Spent Amount
                  </TableCell>
                  <TableCell
                    sx={{ padding: "8px", paddingLeft: 2.2 }}
                  >{`${transaction.amount} Rs`}</TableCell>
                </TableRow>
                <TableRow
                  sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      padding: "8px",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    <AltRouteIcon sx={{ marginRight: 1 }} />
                    Split Between
                  </TableCell>
                  <TableCell sx={{ padding: "8px" }}>
                    <Box>
                      {transaction.splitBetween?.map((item) => (
                        <Chip
                          key={item?.name}
                          label={item?.name}
                          sx={{ margin: "0.2rem" }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                </TableRow>
                <TableRow
                  sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      padding: "8px",
                      borderRight: "1px solid rgba(224, 224, 224, 1)",
                    }}
                  >
                    <PersonIcon sx={{ marginRight: 1 }} />
                    Expense added by
                  </TableCell>
                  <TableCell sx={{ padding: "8px" }}>
                    <Chip
                      key={transaction?.createdBy?.name}
                      label={transaction?.createdBy?.name}
                    />
                  </TableCell>
                </TableRow>
                {transaction?.createdBy?.email === currentUser?.email && (
                  <TableRow
                    sx={{ borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
                  >
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
                            onClick={handleDeleteExpense}
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
        </CardContent>
      </AccordionDetails>
    </Accordion>
  );
};

export default TransactionCard;
