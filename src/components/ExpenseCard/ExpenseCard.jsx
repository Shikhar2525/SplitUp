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
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AltRouteIcon from "@mui/icons-material/AltRoute";

const TransactionCard = ({ transaction }) => {
  const [expanded, setExpanded] = useState(false);

  const handleAccordionChange = () => {
    setExpanded(!expanded);
  };

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
            backgroundColor: "#F44771",
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
            Sept
          </Typography>
          <Typography
            variant="subtitle2"
            component="div"
            sx={{
              fontFamily: "Poppins, sans-serif !important",
              color: "white",
            }}
          >
            28
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
            {transaction.title}
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                fontSize: "10px",
              }}
            >
              Transacion done by
            </Typography>
            <Avatar
              src={`https://mui.com/static/images/avatar/2.jpg`} // Placeholder, adjust as needed
            />
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <CardContent sx={{ padding: "0 !important" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ marginBottom: 1 }}
          >
            {transaction.description}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <AccessTimeIcon sx={{ marginRight: 1 }} />
            Date Created: {new Date(transaction.date).toLocaleDateString()}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", marginTop: 1 }}
          >
            <MonetizationOnIcon sx={{ marginRight: 1 }} />
            {`Spent Amount: ${transaction.amount} Rs`}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: "flex", alignItems: "center", marginTop: 1 }}
          >
            <AltRouteIcon sx={{ marginRight: 1 }} />
            Split Between: {transaction.splitBetween?.join(", ")}{" "}
            {/* Assuming splitBetween is an array */}
          </Typography>
          <Grid container spacing={1} sx={{ marginTop: 1 }}>
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
        </CardContent>
      </AccordionDetails>
    </Accordion>
  );
};

export default TransactionCard;
