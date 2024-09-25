import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import OverViewCard from "../OverViewCard/OverViewCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import GroupCard from "../GroupCard/GroupCard";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Activity from "../Activity/Activity";

function HomeTab() {
  const isMobile = useScreenSize();
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
            amount={100}
            backgroundStyle={{
              background: "linear-gradient(135deg, #f36, #f08)",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OverViewCard
            title={"You give"}
            amount={100}
            backgroundStyle={{
              background: "linear-gradient(135deg, #FF9A3E, #FF6F20)",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <OverViewCard
            title={"Balance"}
            amount={100}
            backgroundStyle={{
              background: "linear-gradient(135deg, #332A7C, #5A4B9A)",
            }}
          />
        </Grid>
      </Grid>

      <Typography
        variant="subtitle1"
        marginTop={3}
        marginLeft={0.5}
        marginBottom={0.5}
        sx={{ color: "#353E6C" }}
      >
        Recent Groups
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <GroupCard
            title={"Trip to Mumbai"}
            subtitle={"Carl added 460 to breakfast"}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <GroupCard title={"School Picnic"} subtitle={"All Settled !"} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <GroupCard title={"Get together"} subtitle={"You owe 251 to joe"} />
        </Grid>
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
            ...(isMobile ? { marginRight: 6 } : {}),
          }}
        >
          Groups <ArrowRightAltIcon />
        </Typography>
      </Box>
      <Activity></Activity>
    </Box>
  );
}

export default HomeTab;
