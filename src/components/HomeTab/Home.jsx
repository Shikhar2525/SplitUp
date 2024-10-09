import { Box, Grid, Typography } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import OverViewCard from "../OverViewCard/OverViewCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import GroupCard from "../GroupCard/GroupCard";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Activity from "../Activity/Activity";
import { useAllGroups } from "../contexts/AllGroups";
import { calculateTotalsAcrossGroups, capitalizeFirstLetter } from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useNavigate } from "react-router-dom";
import activityService from "../services/activity.service";

function HomeTab() {
  const isMobile = useScreenSize();
  const { allGroups } = useAllGroups();
  const { currentUser } = useCurrentUser();
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);

  const fetchLogs = async () => {
    setLoader(true);
    try {
      const fetchedLogs = await activityService.fetchActivitiesByEmail(
        currentUser?.email
      );
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    if (currentUser) {
      fetchLogs();
    }
  }, [currentUser]);

  const { youGet, youGive, balance } = useMemo(() => {
    if (allGroups?.length > 0 && currentUser) {
      return calculateTotalsAcrossGroups(allGroups, currentUser.email);
    }
    return {
      youGet: 0,
      youGive: 0,
      balance: 0,
    };
  }, [allGroups, currentUser]);

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",

        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginTop: 2,
        ...(isMobile ? { alignItems: "flex-start" } : {}),
      }}
    >
      <Typography variant="subtitle1" margin={0.5} sx={{ color: "#353E6C" }}>
        Summary
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <OverViewCard
            title={"You get"}
            amount={youGet}
            backgroundStyle={{
              background: "linear-gradient(135deg, #f36, #f08)",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OverViewCard
            title={"You give"}
            amount={youGive}
            backgroundStyle={{
              background: "linear-gradient(135deg, #FF9A3E, #FF6F20)",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OverViewCard
            title={"Balance"}
            amount={balance}
            backgroundStyle={{
              background: "linear-gradient(135deg, #332A7C, #5A4B9A)",
            }}
          />
        </Grid>
      </Grid>

      {allGroups?.length > 0 && (
        <Typography
          variant="subtitle1"
          marginTop={3}
          marginLeft={0.5}
          marginBottom={0.5}
          sx={{ color: "#353E6C" }}
        >
          Recent Groups
        </Typography>
      )}
      <Grid container spacing={3} justifyContent="flex-start">
        {allGroups?.slice(0, 3).map((group) => {
          return (
            <Grid item xs={12} sm={6} md={4} key={group.id}>
              <GroupCard
                title={capitalizeFirstLetter(group?.title)}
                subtitle={capitalizeFirstLetter(group?.description)}
                groupID={group?.id}
              />
            </Grid>
          );
        })}
      </Grid>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "flex-end",
        }}
      >
        <Typography
          variant="subtitle1"
          marginTop={1}
          marginRight={1}
          sx={{
            display: "flex",
            width: "9%",
            alignItems: "center",
            justifyContent: "space-between",
            flex: 1,
            color: "#353E6C",
            fontSize: 12,
            textDecoration: "underline",
            cursor: "pointer",
            ...(isMobile ? { marginRight: 6 } : {}),
          }}
          onClick={() => navigate("/groups")}
        >
          Groups <ArrowRightAltIcon />
        </Typography>
      </Box>
      <Activity
        isGroupsAvailable={allGroups?.length > 0}
        logs={logs}
        loader={loader}
      ></Activity>
    </Box>
  );
}

export default HomeTab;
