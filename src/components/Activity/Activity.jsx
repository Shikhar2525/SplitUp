import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import "./Activity.scss";
import {
  convertCurrency,
  formatFirestoreTimestamp,
  sortLogsByDate,
} from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useNavigate } from "react-router-dom";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";

const Activity = ({ isGroupsAvailable, logs, loader }) => {
  // Sample data for activities
  const [activities, setActivities] = useState([]);
  const { currentUser } = useCurrentUser();
  const navigate = useNavigate();
  const { currentCurrency } = useCurrentCurrency();

  const getLogsView = async () => {
    const sortedLogs = sortLogsByDate(logs);

    const newActivities = await Promise.all(
      sortedLogs.map(async (log, index) => {
        let description = "";
        let amountDescription = `${log?.details?.amount} Rs`; // Default to original amount

        // Convert currency only for addExpense and deleteExpense cases
        if (log?.logType === "addExpense" || log?.logType === "deleteExpense") {
          try {
            const { amount, toCurrency } = await convertCurrency(
              log?.details?.amount,
              log?.details?.currency,
              currentCurrency
            );
            amountDescription = `${amount} ${currentCurrency}`;
          } catch (error) {
            console.error("Currency conversion error:", error);
          }
        }

        switch (log?.logType) {
          case "addExpense":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                added an expense of{" "}
                <span style={{ textDecoration: "underline" }}>
                  {amountDescription}
                </span>{" "}
                for{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log.details.expenseTitle}
                </span>{" "}
                in group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          case "deleteExpense":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                deleted an expense of{" "}
                <span style={{ textDecoration: "underline" }}>
                  {amountDescription}
                </span>{" "}
                for{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log.details.expenseTitle}
                </span>{" "}
                in group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          case "createGroup":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                created a group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          case "deleteGroup":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                deleted the group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          case "addUser":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                added{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log.details.userAffected?.name}
                </span>{" "}
                to group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          case "deleteUser":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                removed{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log.details.userAffected?.name}
                </span>{" "}
                from group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          case "settle":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                settled all balances of{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log.details.userAffected?.name}
                </span>{" "}
                in group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          case "unSettle":
            description = (
              <>
                {log?.details.performedBy?.email === currentUser?.email
                  ? "You"
                  : log?.details.performedBy?.name}{" "}
                unsettled all balances of{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log.details.userAffected?.name}
                </span>{" "}
                in group:{" "}
                <span style={{ textDecoration: "underline" }}>
                  {log?.details?.groupTitle}
                </span>
              </>
            );
            break;

          default:
            description = "Unknown activity";
            break;
        }

        return {
          id: index + 1,
          description,
          date: formatFirestoreTimestamp(log.details.date),
          groupID: log?.details?.groupId,
        };
      })
    );

    setActivities(newActivities);
  };

  useEffect(() => {
    if (logs.length) {
      // Only get logs view if there are logs
      getLogsView();
    }
  }, [currentUser, logs, currentCurrency]);

  return (
    <Box sx={{ width: "100%", marginTop: isGroupsAvailable ? 0 : 1 }}>
      <Typography
        variant="subtitle1"
        marginLeft={0.5}
        sx={{ color: "#353E6C" }}
      >
        Recent Activity
        {loader && <CircularProgress size={15} sx={{ marginLeft: 1 }} />}
      </Typography>
      <Box
        sx={{
          width: "100%",
          overflow: "auto",
          height: isGroupsAvailable ? "26vh" : "50vh",
        }}
      >
        {activities?.length > 0 ? (
          activities.slice(0, 10).map((item) => (
            <Box
              key={item.id} // Unique key for each item
              onClick={() => {
                localStorage.setItem(
                  "currentGroupID",
                  JSON.stringify(item.groupID)
                );
                navigate("/groups");
              }}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                borderRadius: "8px",
                boxShadow: 2,
                padding: 1,
                marginTop: 1,
                marginRight: 1,
                backgroundColor: "#fff",
                cursor: "pointer",
              }}
            >
              <Typography variant="caption" sx={{ color: "#353E6C" }}>
                {item.description}
              </Typography>
              <Typography variant="caption" sx={{ color: "#353E6C" }}>
                {item.date}
              </Typography>
            </Box>
          ))
        ) : (
          <Alert variant="outlined" severity="info" sx={{ marginTop: 2 }}>
            No recent activity
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default Activity;
