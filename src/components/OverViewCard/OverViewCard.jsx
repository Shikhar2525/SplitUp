import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";

function OverViewCard({ title, amount, backgroundStyle }) {
  return (
    <Card
      sx={{
        position: "relative",

        borderRadius: 2,
        overflow: "hidden",
        color: "white",
        display: "flex",
        justifyContent: "space-between", // Adjust content to be on the left
        alignItems: "center",
        fontFamily: "SF Pro Display",
        padding: 1, // Add padding to content area
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, z-index  0s 0.3s", // Initial transition
        "&:hover": {
          transform: "scale(1.05)", // Scale up the card on hover
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // Add shadow on hover
        },
        ...backgroundStyle,
      }}
    >
      {/* Circles for background on the right */}
      <Box
        sx={{
          position: "absolute",
          width: 150,
          height: 150,
          bgcolor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white
          borderRadius: "50%",
          top: -50,
          right: -40,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 100,
          height: 100,
          bgcolor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white
          borderRadius: "50%",
          top: 20,
          right: -10,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 80,
          height: 80,
          bgcolor: "rgba(255, 255, 255, 0.3)", // Semi-transparent white
          borderRadius: "50%",
          bottom: -30,
          right: 20,
        }}
      />
      <CardContent sx={{ padding: 2, zIndex: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            textAlign: "left",
            fontSize: 18,
          }}
        >
          {title}
        </Typography>

        <Typography variant="h5" sx={{ textAlign: "left" }}>
          {amount} Rs
        </Typography>
      </CardContent>
    </Card>
  );
}

export default OverViewCard;
