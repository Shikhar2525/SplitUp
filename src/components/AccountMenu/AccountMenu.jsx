import React, { useEffect, useState } from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  Typography,
  Avatar,
  ListItemIcon,
  Divider,
  Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth0 } from "@auth0/auth0-react";
import { useCurrentUser } from "../contexts/CurrentUser";

const AccountMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { logout } = useAuth0();
  const { currentUser } = useCurrentUser();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async () => {
    await logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        size="small"
        edge="end"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <Avatar sx={{ bgcolor: "#8675FF", width: 45, height: 45 }}>
          <Avatar
            alt={currentUser?.firstName + " " + currentUser?.lastName}
            src={currentUser?.profilePicture}
            sx={{ width: 40, height: 40 }}
          />
        </Avatar>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        {/* Display User's Name */}
        <MenuItem sx={{ display: "flex", alignItems: "center" }}>
          <Avatar
            alt={currentUser?.firstName + " " + currentUser?.lastName} // Alt text for accessibility
            src={currentUser?.profilePicture}
            sx={{ width: 30, height: 30, marginRight: 1 }}
          />
          <Typography sx={{ color: "#353E6C" }}>
            {currentUser?.firstName + " " + currentUser?.lastName || "User"}
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <PersonIcon fontSize="small" sx={{ color: "#8675FF" }} />
          </ListItemIcon>
          <Typography sx={{ color: "#353E6C" }}>Profile</Typography>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" sx={{ color: "#FD7289" }} />
          </ListItemIcon>
          <Typography sx={{ color: "#353E6C" }}>Settings</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" sx={{ color: "#353E6C" }} />
          </ListItemIcon>
          <Typography sx={{ color: "#353E6C" }}>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AccountMenu;
