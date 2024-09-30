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
  Avatar,
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
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import { formatTransactionDate } from "../utils";

const TransactionCard = ({ transaction, index }) => {
  const [expanded, setExpanded] = useState(false);
  const dateShort = formatTransactionDate(transaction?.date);
  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };
  const colors = ["#FFBB38", "#F44771", "#332A7C", "#16DBCC"];
  return (
    <Accordion
      sx={{
        marginBottom: 1.5,
        borderRadius: 2,
        boxShadow: 3,

        width: "100%", // Full width
        fontFamily: "Poppins, sans-serif", // Apply Poppins font
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
            height: "100%", // Cover entire height of accordion
            width: 50,
            position: "absolute", // Position the box absolutely
            left: 0, // Align to the left
            top: 0, // Align to the top
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="subtitle1"
            component="div"
            sx={{
              fontFamily: "Poppins, sans-serif !important",
              color: "white",
            }}
          >
            {dateShort?.month}
          </Typography>
          <Typography
            variant="subtitle2"
            component="div"
            sx={{
              fontFamily: "Poppins, sans-serif !important",
              color: "white",
            }}
          >
            {dateShort?.day}
          </Typography>
        </Box>

        {/* Flex container for title and amount */}
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
              fontFamily: "Poppins, sans-serif !important",
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
              color: "#353E6C ",
            }}
          >
            {transaction.amount} Rs {/* Removed dollar sign */}
          </Typography>

          <Avatar
            sx={{ width: 25, height: 25 }}
            src={`https://mui.com/static/images/avatar/2.jpg`} // Placeholder, adjust as needed
          />
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
                      key={transaction?.nameOrEmail}
                      label={transaction?.nameOrEmail}
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
                    Date Created
                  </TableCell>
                  <TableCell sx={{ padding: "8px" }}>
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
                          key={item}
                          label={item}
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
                    Actions:
                  </TableCell>
                  <TableCell sx={{ padding: "8px" }}>
                    <Grid container spacing={1}>
                      <Grid item>
                        <IconButton color="primary" aria-label="edit">
                          <EditIcon />
                        </IconButton>
                      </Grid>
                      <Grid item>
                        <IconButton color="error" aria-label="delete">
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </AccordionDetails>
    </Accordion>
  );
};

export default TransactionCard;
