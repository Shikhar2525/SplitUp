import React, { useState, useEffect } from "react";
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
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuIcon from "@mui/icons-material/Menu";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PaymentsIcon from '@mui/icons-material/Payments';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { styled } from '@mui/system';

import { useScreenSize } from "../contexts/ScreenSizeContext";
import "./Navigration.scss";
import { useNavigate } from "react-router-dom";

const illustrations = [
  {
    icon: <PaymentsIcon sx={{ fontSize: 32, color: '#5e72e4' }} />,
    caption: "Split bills",
  },
  {
    icon: <PeopleAltIcon sx={{ fontSize: 32, color: '#5e72e4' }} />,
    caption: "Track with friends",
  },
  {
    icon: <AccountBalanceIcon sx={{ fontSize: 32, color: '#5e72e4' }} />,
    caption: "Settle up",
  }
];

const versions = [
  {
    label: 'v2.0.0',
    value: 'v2.0.0',
    url: 'https://splitup-633cc--testing-j5y7qc46.web.app/',
    type: 'beta'
  },
  {
    label: 'v1.0.0',
    value: 'v1.0.0',
    url: 'https://splitup-633cc.web.app/',
    type: 'stable'
  }
];

const VersionSelect = styled(Select)(({ theme }) => ({
  '& .MuiSelect-select': {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: '32px !important',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#5e72e4',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
}));

function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentIllustration, setCurrentIllustration] = useState(0);
  const [currentVersion, setCurrentVersion] = useState(versions[0]);
  const navigate = useNavigate();
  const isMobile = useScreenSize();
  const isNineundredPixel = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIllustration((prev) => (prev + 1) % illustrations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleVersionChange = (event) => {
    const newVersion = versions.find(v => v.value === event.target.value);
    setCurrentVersion(newVersion);
    window.location.href = newVersion.url;
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

  const VersionSelector = () => (
    <Box
      sx={{
        display: { xs: 'flex', md: 'flex' },
        alignItems: 'center',
        px: { xs: 1, sm: 1.5 },
        py: 0.5,
        borderRadius: '8px',
        backgroundColor: 'rgba(94, 114, 228, 0.05)',
        border: '1px solid rgba(94, 114, 228, 0.1)',
        mt: { xs: 0, sm: 2 },
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(94, 114, 228, 0.08)',
          border: '1px solid rgba(94, 114, 228, 0.2)',
        }
      }}
    >
      <VersionSelect
        value={currentVersion.value}
        onChange={handleVersionChange}
        IconComponent={KeyboardArrowDownIcon}
        MenuProps={{
          PaperProps: {
            sx: {
              mt: 1,
              borderRadius: '12px',
              backgroundColor: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              '& .MuiMenuItem-root': {
                fontSize: '0.75rem',
                minHeight: '32px',
                gap: 1,
                mx: 0.5,
                my: 0.25,
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(94, 114, 228, 0.08)',
                },
              },
            },
          },
        }}
      >
        {versions.map((version) => (
          <MenuItem key={version.value} value={version.value}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              width: '100%',
              justifyContent: 'space-between'
            }}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                {version.label}
              </Typography>
              <Chip
                label={version.type}
                size="small"
                sx={{
                  height: 16,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  backgroundColor: version.type === 'stable' 
                    ? 'rgba(45, 206, 137, 0.1)' 
                    : 'rgba(251, 99, 64, 0.1)',
                  color: version.type === 'stable' 
                    ? '#2dce89' 
                    : '#fb6340',
                }}
              />
            </Box>
          </MenuItem>
        ))}
      </VersionSelect>
    </Box>
  );

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
        {/* Updated Logo Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            width: '100%',
            position: 'relative',
            p: 1,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80%',
              height: '2px',
              background: 'linear-gradient(90deg, transparent, #5e72e4, transparent)',
              borderRadius: '2px'
            }
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(94, 114, 228, 0.1), rgba(130, 94, 228, 0.1))',
              borderRadius: '14px',
              p: 1,
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-2px)',
                '& .logo-icon': {
                  transform: 'rotate(360deg)',
                },
                '&::after': {
                  transform: 'translateX(100%)'
                }
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'transform 0.5s ease',
              }
            }}
          >
            <AltRouteIcon 
              className="logo-icon"
              sx={{ 
                color: "#5e72e4",
                fontSize: { xs: 24, sm: 28, md: 32 },
                flexShrink: 0,
                transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: 'drop-shadow(0 2px 4px rgba(94, 114, 228, 0.2))'
              }} 
            />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "18px", sm: "20px", md: "24px" },
              background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              lineHeight: 1,
              textShadow: '0 2px 10px rgba(94, 114, 228, 0.2)',
              position: 'relative',
              transform: 'translateZ(0)',
              '&:hover': {
                transform: 'scale(1.05) translateZ(0)',
                transition: 'transform 0.3s ease'
              }
            }}
          >
            SplitUp
          </Typography>
        </Box>

        {/* Version selector for mobile/tablet */}
        <VersionSelector />
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

      {/* Moved Illustration section to bottom */}
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 20, // Adjusted to be closer to bottom
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80%',
            display: { xs: 'none', md: 'block' },
            opacity: 0.9,
            transition: 'all 0.3s ease',
            zIndex: 1 // Ensure it stays above other content
          }}
        >
          <Box sx={{
            position: 'relative',
            p: 2,
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(94, 114, 228, 0.1), rgba(130, 94, 228, 0.1))',
            textAlign: 'center',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(94, 114, 228, 0.2)',
            overflow: 'hidden',
            '&:hover': {
              background: 'linear-gradient(135deg, rgba(94, 114, 228, 0.15), rgba(130, 94, 228, 0.15))',
              '& .illustration-icon': {
                transform: 'translateY(-5px)',
              }
            }
          }}>
            {/* Icon */}
            <Box className="illustration-icon" sx={{
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              mb: 1
            }}>
              {illustrations[currentIllustration].icon}
            </Box>
            
            {/* Caption */}
            <Typography
              variant="caption"
              sx={{
                color: '#5e72e4',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}
            >
              {illustrations[currentIllustration].caption}
            </Typography>

            {/* Decorative dots */}
            <Box sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.2,
              backgroundImage: `
                radial-gradient(circle at 20% -50%, #5e72e4 2px, transparent 3px),
                radial-gradient(circle at 75% 150%, #5e72e4 2px, transparent 3px),
                radial-gradient(circle at 100% 50%, #5e72e4 1px, transparent 2px),
                radial-gradient(circle at 50% -20%, #5e72e4 1px, transparent 2px),
                radial-gradient(circle at 0% 80%, #5e72e4 1px, transparent 2px)
              `,
              backgroundSize: '40px 40px',
              animation: 'floating 15s linear infinite',
              '@keyframes floating': {
                '0%': { backgroundPosition: '0 0' },
                '100%': { backgroundPosition: '40px 40px' }
              }
            }}/>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Navigation;
