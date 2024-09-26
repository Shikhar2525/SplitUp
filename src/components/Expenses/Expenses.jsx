import React from "react";
import { Box } from "@mui/material";

import ExpenseCard from "../ExpenseCard/ExpenseCard";

const Expenses = () => {
  return (
    <Box sx={{ height: "45vh", overflow: "auto" }}>
      <ExpenseCard
        transaction={{
          id: 1,
          title: "Dinner with friends",
          description: "Splitting the bill for dinner.",
          amount: 45,
          currency: "USD",
          date: "2024-09-25",
          splitBetween: ["Shikhar", "Modiji"],
        }}
      />
      <ExpenseCard
        transaction={{
          id: 1,
          title: "Dinner with friends",
          description: "Splitting the bill for dinner.",
          amount: 45,
          currency: "USD",
          date: "2024-09-25",
          splitBetween: ["Shikhar", "Modiji"],
        }}
      />
      <ExpenseCard
        transaction={{
          id: 1,
          title: "Dinner with friends",
          description: "Splitting the bill for dinner.",
          amount: 45,
          currency: "USD",
          date: "2024-09-25",
          splitBetween: ["Shikhar", "Modiji"],
        }}
      />
    </Box>
  );
};

export default Expenses;
