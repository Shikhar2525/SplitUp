import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import "./Activity.scss";
import { sortLogsByDate } from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";

const Activity = ({ isGroupsAvailable, logs }) => {
  // Sample data for activities
  const [activities, setActivities] = useState([]);
  const { currentUser } = useCurrentUser();

  const getLogsView = () => {
    const sortedLogs = sortLogsByDate(logs);
    console?.log(sortedLogs);

    const newActivities = sortedLogs.map((log, index) => {
      let description = "";

      switch (log?.logType) {
        case "addExpense":
          description = (
            <>
              {log?.details.performedBy?.email === currentUser?.email
                ? "You"
                : log?.details.performedBy?.name}{" "}
              added an expense of{" "}
              <span style={{ textDecoration: "underline" }}>
                {log?.details?.amount} Rs
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
                : log?.details.performedBy}{" "}
              deleted an expense of{" "}
              <span style={{ textDecoration: "underline" }}>
                {log?.details?.amount} Rs
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
                : log?.details.performedBy}{" "}
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
              {log?.details.performedBy.email === currentUser?.email
                ? "You"
                : log?.details.performedBy.name}{" "}
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
              {log?.details.performedBy.email === currentUser?.email
                ? "You"
                : log?.details.performedBy.name}{" "}
              removed{" "}
              <span style={{ textDecoration: "underline" }}>
                {log.details.userAffected.email === currentUser.email
                  ? "yourself"
                  : log.details.userAffected.name}
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
                : log?.details.performedBy.name}{" "}
              settled all balances of{" "}
              <span style={{ textDecoration: "underline" }}>
                {log.details.userAffected.name}
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
          description = "Unknown activity"; // Fallback for unexpected logTypes
          break;
      }

      return {
        id: index + 1,
        description,
        date: new Date(log.details.date.seconds * 1000).toLocaleString(), // Convert seconds to a readable date format
      };
    });

    setActivities(newActivities);
  };

  console.log(activities);
  useEffect(() => {
    if (logs.length) {
      // Only get logs view if there are logs
      getLogsView();
    }
  }, [currentUser, logs]);

  return (
    <Box sx={{ width: "100%", marginTop: isGroupsAvailable ? 0 : 1 }}>
      <Typography
        variant="subtitle1"
        marginLeft={0.5}
        sx={{ color: "#353E6C" }}
      >
        Recent Activity
      </Typography>
      <Box
        sx={{
          width: "100%",
          overflow: "auto",
          height: isGroupsAvailable ? "26vh" : "50vh",
        }}
      >
        {activities.slice(0, 10).map((item) => (
          <Box
            key={item.id} // Unique key for each item
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
            <Typography variant="caption" sx={{ color: "#353E6C" }}>
              {item.description}
            </Typography>
            <Typography variant="caption" sx={{ color: "#353E6C" }}>
              {item.date}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Activity;
