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
import { useNavigate } from "react-router-dom";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import GroupAddIcon from '@mui/icons-material/GroupAdd';

function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useScreenSize();
  const isNineundredPixel = useMediaQuery("(max-width:900px)");

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const list = () => {
    const isCurrentPath = (path) => window.location.pathname === path;
    
    return (
      <List sx={{ 
        width: '100%',
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
        marginTop: { xs: 2, sm: 3, md: 4 },
        gap: { xs: 0.5, sm: 0.8 },
        '& .MuiListItem-root': {
          width: '100%',
          borderRadius: '12px',
          margin: '2px 0',
        }
      }}>
        {[
          { path: '/', icon: <HomeIcon />, text: 'Home' },
          { path: '/groups', icon: <Diversity3Icon />, text: 'Groups' },
          { path: '/friends', icon: <GroupAddIcon />, text: 'Friends' }
        ].map((item) => (
          <ListItem
            key={item.path}
            sx={{
              position: 'relative',
              overflow: 'visible',
              backgroundColor: isCurrentPath(item.path) ? 'rgba(94, 114, 228, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(94, 114, 228, 0.15)',
                transform: 'translateX(6px)',
                '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                  color: '#5e72e4'
                }
              },
              '&::before': isCurrentPath(item.path) ? {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: '#5e72e4',
                borderRadius: '0 4px 4px 0',
              } : {},
              justifyContent: { xs: 'flex-start', sm: 'center', md: 'flex-start' }, // Center content in tablet view
              '& .MuiListItemIcon-root': {
                minWidth: { xs: 36, sm: 40 },
                display: 'flex',
                justifyContent: { xs: 'flex-start', sm: 'center', md: 'flex-start' }
              },
              '& .MuiListItemText-root': {
                flex: { xs: '1 1 auto', sm: '0 1 auto' },
                textAlign: { xs: 'left', sm: 'center', md: 'left' }
              }
            }}
            button
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon sx={{ 
              minWidth: 36,
              color: isCurrentPath(item.path) ? '#5e72e4' : '#64748b',
              transition: 'color 0.3s ease'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.95rem',
                  fontWeight: isCurrentPath(item.path) ? 600 : 500,
                  color: isCurrentPath(item.path) ? '#5e72e4' : '#64748b',
                  transition: 'color 0.3s ease'
                }
              }}
            />
          </ListItem>
        ))}
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
        flexBasis: isMobile ? 0 : { xs: '20%', sm: '15%', md: '12%' }, // Adjusted basis
        minWidth: { xs: '100%', sm: '200px', md: '220px' }, // Added minimum width
        maxWidth: { sm: '250px', md: '280px' }, // Added maximum width
        flexShrink: 0,
        padding: { xs: 2, sm: 2.5, md: 3 }, // Adjusted padding
        zIndex: 100,
        position: 'relative',
        ...(isMobile
          ? {
              gap: "40px",
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "flex-end",
              width: "100%",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
            }
          : {
              flexDirection: "column",
              alignItems: "center", // Center everything
              justifyContent: "flex-start",
              boxShadow: "10px 10px 30px rgba(0, 0, 0, 0.1)",
              borderTopLeftRadius: "30px",
              borderBottomLeftRadius: "30px",
            }),
      }}
    >
      <Box sx={{
        width: '100%',
        display: 'flex',
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: { xs: 'center', sm: 'center' },
        justifyContent: { xs: 'space-between', sm: 'center' },
        mb: { xs: 0, sm: 2 }
      }}>
        {/* Logo Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          width: '100%'
        }}>
          <AltRouteIcon 
            sx={{ 
              color: "#1976d2", 
              fontSize: { xs: 24, sm: 28, md: 32 },
              flexShrink: 0
            }} 
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "18px", sm: "20px", md: "22px" },
              color: "#4D4D4D",
              lineHeight: 1,
            }}
          >
            SplitUp
          </Typography>
        </Box>

        {/* Version badge for mobile/tablet */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            px: { xs: 1, sm: 1.5 },
            py: 0.5,
            borderRadius: '8px',
            backgroundColor: 'rgba(25, 118, 210, 0.05)',
            border: '1px solid rgba(25, 118, 210, 0.1)',
            mt: { xs: 0, sm: 2 }
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#1976d2',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.02em'
            }}
          >
            v1.0.0
          </Typography>
        </Box>
      </Box>

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

      {/* Desktop version badge */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          gap: 1,
          padding: '8px 12px',
          borderRadius: '20px',
          backgroundColor: 'rgba(25, 118, 210, 0.05)',
          border: '1px solid rgba(25, 118, 210, 0.1)',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            border: '1px solid rgba(25, 118, 210, 0.2)',
          }
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: '#1976d2',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          v1.0.0
        </Typography>
      </Box>
    </Box>
  );
}

export default Navigation;
