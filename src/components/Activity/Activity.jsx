import React from "react";
import { Box, List, ListItem, ListItemText, Typography } from "@mui/material";

const Activity = () => {
  // Sample data for activities
  const activities = [];

  return activities.map((item) => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "98%",
          borderRadius: "8px",
          boxShadow: 2,
          padding: 1,

          marginTop: 1,
          overflowY: "auto", // Enables vertical scrolling
          backgroundColor: "#fff",
        }}
      >
        <Box>
          <Typography variant="caption" color="initial">
            {item.description}
          </Typography>
        </Box>
        <Box>
          {" "}
          <Typography variant="caption" color="initial">
            {item.date}
          </Typography>
        </Box>
      </Box>
    );
  });
};

export default Activity;
