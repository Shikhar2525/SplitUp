import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  ListItemIcon,
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuIcon from "@mui/icons-material/Menu";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import "./Navigration.scss";
import { useNavigate } from "react-router";
import { useCurrentTab } from "../contexts/CurrentTabContext";

function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useScreenSize();
  const { setCurrentTab } = useCurrentTab();
  const isNineundredPixel = useMediaQuery("(max-width:900px)");

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const list = () => {
    return (
      <List
        sx={{ display: "flex", flexDirection: "column", marginTop: 5, gap: 1 }}
      >
        <ListItem
          sx={{ padding: 0 }}
          button
          onClick={() => {
            navigate("/");
          }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        <ListItem
          sx={{ padding: 0 }}
          button
          onClick={() => {
            navigate("/groups");
          }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <Diversity3Icon />
          </ListItemIcon>
          <ListItemText primary="Groups" />
        </ListItem>
      </List>
    );
  };

  return (
    <Box
      className="navigationContainer"
      sx={{
        flex: 1,
        display: "flex",
        height: isNineundredPixel ? "122vh" : "100%",
        overflow: "hidden",
        backgroundColor: "white",
        flexBasis: isMobile ? 0 : "10%", // Fixed width for Navigation to 25%
        flexShrink: 0, // Prevents it from shrinking

        padding: 4,
        zIndex: 100,
        ...(isMobile
          ? {
              gap: "40px",
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "100%",
              flexBasis: "10%",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", // Shadow at the bottom
            }
          : {
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              boxShadow: "10px 10px 30px rgba(0, 0, 0, 0.1)",
              borderTopLeftRadius: "30px",
              borderBottomLeftRadius: "30px",
            }),
      }}
    >
      <Typography
        sx={{
          fontWeight: 600, // Semi-bold
          fontSize: "25px",
          color: "#4D4D4D",
        }}
        variant="h5"
      >
        SplitUp
      </Typography>
      {isMobile ? (
        <>
          <AppBar
            position="static"
            sx={{ backgroundColor: "transparent", boxShadow: "none" }}
          >
            <Toolbar>
              <IconButton
                sx={{ color: "grey", padding: 0 }}
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Drawer
            sx={{
              "& .MuiDrawer-paper": {
                backgroundColor: "white", // Background color for the Drawer
                padding: "25px", // Padding for the Drawer content
              },
            }}
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {list()}
          </Drawer>
        </>
      ) : (
        list()
      )}
    </Box>
  );
}

export default Navigation;
