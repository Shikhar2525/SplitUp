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
  Select,
  MenuItem,
  Chip,
  styled,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import "./Navigration.scss";
import { useNavigate } from "react-router-dom";
import AltRouteIcon from "@mui/icons-material/AltRoute";

const versions = [
  {
    label: "v2.0.0",
    value: "v2.0.0",
    url: "https://splitup-633cc--testing-j5y7qc46.web.app/",
    type: "beta",
  },
  {
    label: "v1.0.0",
    value: "v1.0.0",
    url: "https://splitup-633cc.web.app/",
    type: "stable",
  },
];

const VersionSelect = styled(Select)(({ theme }) => ({
  "& .MuiSelect-select": {
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 12,
    paddingRight: "32px !important",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#5e72e4",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
}));

function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useScreenSize();
  const isNineundredPixel = useMediaQuery("(max-width:900px)");
  const [currentVersion, setCurrentVersion] = useState(versions[0]);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  const handleVersionChange = (event) => {
    const newVersion = versions.find((v) => v.value === event.target.value);
    setCurrentVersion(newVersion);
    window.location.href = newVersion.url;
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

  const VersionSelector = () => (
    <Box
      sx={{
        mt: { xs: 2, sm: "auto" },
        px: { xs: 1, sm: 1.5 },
        py: 0.5,
        borderRadius: "8px",
        backgroundColor: "rgba(94, 114, 228, 0.05)",
        border: "1px solid rgba(94, 114, 228, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              "& .MuiMenuItem-root": {
                fontSize: "0.75rem",
                minHeight: "32px",
                gap: 1,
                mx: 0.5,
                my: 0.25,
                borderRadius: "8px",
                "&:hover": {
                  backgroundColor: "rgba(94, 114, 228, 0.08)",
                },
              },
            },
          },
        }}
      >
        {versions.map((version) => (
          <MenuItem key={version.value} value={version.value}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                {version.label}
              </Typography>
              <Chip
                label={version.type}
                size="small"
                sx={{
                  height: 16,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  backgroundColor:
                    version.type === "stable"
                      ? "rgba(45, 206, 137, 0.1)"
                      : "rgba(251, 99, 64, 0.1)",
                  color:
                    version.type === "stable" ? "#2dce89" : "#fb6340",
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
        flexBasis: isMobile ? 0 : "10%",
        flexShrink: 0,
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
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
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
      {/* Logo and Version Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "row", sm: "column" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1, sm: 2 },
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: "25px",
            color: "#4D4D4D",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          variant="h5"
        >
          <AltRouteIcon sx={{ color: "#1976d2", fontSize: 35 }} />
          SplitUp
        </Typography>

        {/* Version Selector */}
        <VersionSelector />
      </Box>

      {/* Navigation List */}
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
                backgroundColor: "white",
                padding: "25px",
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
