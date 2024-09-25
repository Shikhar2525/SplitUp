import React from "react";
import { Box, Typography } from "@mui/material";
import "./Activity.scss";

const Activity = () => {
  // Sample data for activities
  const activities = [
    {
      id: 1,
      description: "You paid $20 for dinner with John",
      date: "2024-09-24",
    },
    {
      id: 2,
      description: "You owe $10 to Sarah for lunch",
      date: "2024-09-23",
    },
    {
      id: 3,
      description: "You split the $50 bill with Mike",
      date: "2024-09-22",
    },
    {
      id: 4,
      description: "You received $15 from Emma for groceries",
      date: "2024-09-21",
    },
    {
      id: 5,
      description: "You paid $30 for concert tickets",
      date: "2024-09-20",
    },
    // Add more activities as needed
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="subtitle1"
        marginLeft={0.5}
        sx={{ color: "#353E6C" }}
      >
        Recent Activity
      </Typography>
      <Box sx={{ width: "100%", overflow: "auto", height: "26vh" }}>
        {activities.map((item) => {
          return (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",

                borderRadius: "8px",
                boxShadow: 2,
                padding: 1,

                marginTop: 1,
                marginRight: 1,
                backgroundColor: "#fff",
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "#353E6C" }}>
                  {item.description}
                </Typography>
              </Box>
              <Box>
                {" "}
                <Typography variant="caption" sx={{ color: "#353E6C" }}>
                  {item.date}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Activity;
