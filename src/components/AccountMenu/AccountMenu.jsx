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
  Select,
  InputLabel,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth0 } from "@auth0/auth0-react";
import { useCurrentUser } from "../contexts/CurrentUser";
import { currencies } from "../../constants";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";

const AccountMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { logout } = useAuth0();
  const { currentUser } = useCurrentUser();

  const { currentCurrency, setCurrentCurrency } = useCurrentCurrency();

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
            alt={currentUser?.name}
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
            alt={currentUser?.name} // Alt text for accessibility
            src={currentUser?.profilePicture}
            sx={{ width: 30, height: 30, marginRight: 1 }}
          />
          <Typography sx={{ color: "#353E6C" }}>
            {currentUser?.name || "User"}
          </Typography>
        </MenuItem>
        <Divider />

        <MenuItem
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <InputLabel id="currency-select-label">
            Select to view converted amounts
          </InputLabel>
          <Select
            fullWidth
            sx={{ height: "2.8rem" }}
            labelId="currency-select-label"
            id="currency-select"
            value={currentCurrency}
            onChange={(e) => setCurrentCurrency(e.target.value)}
          >
            {currencies.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <img
                  src={option.flag}
                  alt={`${option.value} flag`}
                  width="20"
                  height="15"
                  style={{ marginRight: "8px", verticalAlign: "middle" }}
                />
                {option.label}
              </MenuItem>
            ))}
          </Select>
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
