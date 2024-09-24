import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import OverViewCard from "../OverViewCard/OverViewCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import GroupCard from "../GroupCard/GroupCard";

function HomeTab() {
  const isMobile = useScreenSize();
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        overflow: "auto",
        width: "100%",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        marginTop: 2,
        ...(isMobile ? { alignItems: "flex-start" } : {}),
      }}
    >
      <Typography
        variant="subtitle1"
        margin={0.5}
        sx={{ color: "#353E6C", fontFamily: "Poppins, sans serif" }}
      >
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
        sx={{ color: "#353E6C", fontFamily: "Poppins, sans serif" }}
      >
        Groups
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <GroupCard
            title={"You get"}
            rightImage={
              "https://pixabay.com/photos/lake-nature-travel-exploration-6701636/"
            }
            amount={100}
            backgroundStyle={{
              background: "linear-gradient(135deg, #f36, #f08)",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <GroupCard
            title={"You give"}
            amount={100}
            backgroundStyle={{
              background: "linear-gradient(135deg, #FF9A3E, #FF6F20)",
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <GroupCard
            title={"Balance"}
            amount={100}
            backgroundStyle={{
              background: "linear-gradient(135deg, #332A7C, #5A4B9A)",
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default HomeTab;
