import React from "react";
import { Box, Typography } from "@mui/material";

import ExpenseCard from "../ExpenseCard/ExpenseCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import { useAllGroups } from "../contexts/AllGroups";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import { sortByISODate } from "../utils";
import { Empty } from "antd";
import { useAllUserSettled } from "../contexts/AllUserSettled";

const Expenses = () => {
  const isMobile = useScreenSize();
  const { allGroups } = useAllGroups();
  const { currentGroupID } = useCurrentGroup();
  const currentGroup = allGroups?.find((item) => item?.id === currentGroupID);
  const { allUserSettled } = useAllUserSettled();

  return (
    <Box
      sx={{
        height: allUserSettled ? (isMobile ? "50vh" : "45vh") : "53vh",
        overflow: "auto",
        paddingRight: isMobile ? 1 : 2,
      }}
    >
      {sortByISODate(currentGroup?.expenses)?.map((expense, index) => {
        return (
          <ExpenseCard
            groupTitle={currentGroup?.title}
            groupAdmin={currentGroup?.admin?.email}
            transaction={{
              id: expense?.id,
              paidBy: expense?.paidBy,
              description: expense?.description,
              amount: expense?.amount,
              date: expense?.createdDate,
              splitBetween: expense?.splitBetween,
              createdBy: expense?.createdBy,
              currency: expense?.currency,
              excludePayer: expense?.excludePayer
            }}
            index={index}
            groupId={currentGroupID}
          />
        );
      })}
      {currentGroup?.expenses?.length <= 0 && (
        <Empty
          style={{ marginTop: 100 }}
          description={
            <Typography variant="subtitle2">No expense, add new</Typography>
          }
        ></Empty>
      )}
    </Box>
  );
};

export default Expenses;
