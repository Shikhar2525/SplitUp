import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

function GroupCard({ title, subtitle, groupID }) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => {
        localStorage.setItem("currentGroupID", JSON.stringify(groupID));
        navigate("/groups");
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        borderRadius: "30px",
        height: "100%",
        paddingLeft: 1,
        paddingRight: 2,
        position: "relative",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        cursor: "pointer", // Add this to show mouse cursor as a button
        transition:
          "transform 0.3s ease, box-shadow 0.3s ease, z-index  0s 0.3s", // Initial transition
        "&:hover": {
          transform: "scale(1.05)", // Scale up the card on hover
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)", // Add shadow on hover
        },
      }}
    >
      {/* Image Background */}
      <CardMedia
        component="img"
        src="/assets/img/plane.jpg" // Ensure this path is correct
        alt={title}
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          objectFit: "cover",
          zIndex: 1,
          opacity: 0.9,
          filter: "blur(0.5px)",
        }}
      />

      {/* Overlay for Better Text Contrast */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      />

      <Box
        sx={{ display: "flex", flexDirection: "column", flex: 1, zIndex: 2 }}
      >
        <CardContent
          sx={{
            flex: "1 0 auto",
            zIndex: 3,
            borderRadius: "30px",
            padding: 2,
          }}
        >
          <Typography
            component="div"
            variant="h6"
            sx={{ fontWeight: "bold", color: "white" }}
          >
            {title}
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={{
              color: "white",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              lineClamp: 2,
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </Typography>
          <Typography
            variant="subtitle2"
            component="div"
            sx={{
              fontSize: 12,
              color: "white",
              textDecoration: "underline",
            }}
          >
            Details
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );
}

export default GroupCard;
