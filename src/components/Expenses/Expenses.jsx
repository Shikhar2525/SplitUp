import React from "react";
import { Box, Typography } from "@mui/material";

import ExpenseCard from "../ExpenseCard/ExpenseCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useAllGroups } from "../contexts/AllGroups";
import { useCurrentGroup } from "../contexts/CurrentGroup";

const Expenses = () => {
  const isMobile = useScreenSize();
  const { allGroups } = useAllGroups();
  const { currentGroupID } = useCurrentGroup();
  const currentGroup = allGroups?.find((item) => item?.id === currentGroupID);
  return (
    <Box
      sx={{ height: "53vh", overflow: "auto", paddingRight: isMobile ? 1 : 2 }}
    >
      {currentGroup?.expense?.lenght > 0 ? (
        currentGroup?.expenses?.map((expense) => {
          return (
            <ExpenseCard
              transaction={{
                nameOrEmail: expense?.paidBy,
                description: expense?.description,
                amount: expense?.amount,
                currency: "USD",
                date: expense?.date,
                splitBetween: expense?.splitBetween,
              }}
            />
          );
        })
      ) : (
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          No expenses
        </Typography>
      )}
    </Box>
  );
};

export default Expenses;
