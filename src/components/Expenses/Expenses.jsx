import React from "react";
import { Box } from "@mui/material";

import ExpenseCard from "../ExpenseCard/ExpenseCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";

const Expenses = () => {
  const isMobile = useScreenSize();
  return (
    <Box
      sx={{ height: "53vh", overflow: "auto", paddingRight: isMobile ? 1 : 2 }}
    >
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
