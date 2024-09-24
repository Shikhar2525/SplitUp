import { Box, Card, CardContent, Typography } from "@mui/material";
import React from "react";

function GroupCard({ title, amount, backgroundStyle, leftImage, rightImage }) {
  return (
    <Card
      sx={{
        position: "relative",
        width: 250,
        height: 120,
        borderRadius: 2,
        overflow: "hidden",
        color: "white",
        display: "flex",
        alignItems: "center",
        fontFamily: "SF Pro Display",
        padding: 1,
        ...backgroundStyle,
      }}
    >
      {/* Left Image */}
      {leftImage && (
        <Box
          component="img"
          src={leftImage}
          alt="Left Icon"
          sx={{
            position: "absolute",
            width: 50, // Set the desired width
            height: 50, // Set the desired height
            left: 10, // Adjust the left position
            zIndex: 1,
          }}
        />
      )}

      {/* Right Image */}
      {rightImage && (
        <Box
          component="img"
          src={rightImage}
          alt="Right Icon"
          sx={{
            position: "absolute",
            width: 50, // Set the desired width
            height: 50, // Set the desired height
            right: 10, // Adjust the right position
            zIndex: 1,
          }}
        />
      )}

      <CardContent sx={{ padding: 2, zIndex: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontFamily: "Poppins, sans-serif",
            textAlign: "left",
            fontSize: 18,
          }}
        >
          {title}
        </Typography>
        {amount && (
          <Typography
            variant="h5"
            sx={{ fontFamily: "Poppins, sans-serif", textAlign: "left" }}
          >
            {amount} Rs
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default GroupCard;
