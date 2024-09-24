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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";

import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuIcon from "@mui/icons-material/Menu";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import "./Navigration.scss";

function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useScreenSize();

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const list = () => {
    return (
      <List
        sx={{ display: "flex", flexDirection: "column", marginTop: 5, gap: 2 }}
      >
        <ListItem button>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        <ListItem button>
          <ListItemIcon>
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
        overflow: "auto",
        backgroundColor: "#FFF5D9",
        width: "25%",
        padding: 4,
        ...(isMobile
          ? {
              gap: "30px",
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "flex-end",
            }
          : {
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "flex-start",
            }),
      }}
    >
      <Typography
        sx={{
          fontFamily: "Poppins, sans-serif",
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

          <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
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
