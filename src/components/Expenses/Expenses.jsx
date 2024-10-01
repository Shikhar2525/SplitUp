import React from "react";
import { Box } from "@mui/material";

import ExpenseCard from "../ExpenseCard/ExpenseCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useAllGroups } from "../contexts/AllGroups";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import { sortByISODate } from "../utils";

const Expenses = () => {
  const isMobile = useScreenSize();
  const { allGroups } = useAllGroups();
  const { currentGroupID } = useCurrentGroup();
  const currentGroup = allGroups?.find((item) => item?.id === currentGroupID);
  return (
    <Box
      sx={{ height: "53vh", overflow: "auto", paddingRight: isMobile ? 1 : 2 }}
    >
      {sortByISODate(currentGroup?.expenses)?.map((expense, index) => {
        return (
          <ExpenseCard
            transaction={{
              id: expense?.id,
              nameOrEmail: expense?.paidBy,
              description: expense?.description,
              amount: expense?.amount,
              currency: "USD",
              date: expense?.createdDate,
              splitBetween: expense?.splitBetween,
              createdBy: expense?.createdBy,
            }}
            index={index}
          />
        );
      })}
    </Box>
  );
};

export default Expenses;
