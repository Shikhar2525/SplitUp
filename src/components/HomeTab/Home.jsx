import { Box, Grid } from "@mui/material";
import React from "react";
import OverViewCard from "../OverViewCard/OverViewCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";

function HomeTab() {
  const isMobile = useScreenSize();
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        overflow: "auto",
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 2,
        ...(isMobile ? { alignItems: "flex-start" } : {}),
      }}
    >
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
    </Box>
  );
}

export default HomeTab;
