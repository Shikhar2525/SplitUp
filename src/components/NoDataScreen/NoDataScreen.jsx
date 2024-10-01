import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Empty } from "antd";
import { useScreenSize } from "../contexts/ScreenSizeContext";

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
  const { isMobile } = useScreenSize();
  return (
    <Empty
      style={{ ...(!isMobile && { marginTop: 150 }) }}
      description={<Typography variant="subtitle2">{message}</Typography>}
    ></Empty>
  );
};

export default NoDataScreen;
