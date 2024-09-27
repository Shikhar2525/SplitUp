import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const NoDataScreen = ({ message }) => {
  return (
    <StyledContainer>
      <Typography variant="h6" sx={{ marginTop: 2, padding: 2 }}>
        {message}
      </Typography>
    </StyledContainer>
  );
};

export default NoDataScreen;
