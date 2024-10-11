import React, { useEffect, useState } from "react";
import {
  IconButton,
  Popover,
  TextField,
  Button,
  InputAdornment,
  Box,
  Typography,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useCurrentGroup } from "../contexts/CurrentGroup";
import { useAllGroups } from "../contexts/AllGroups";

const ShareLinkPopover = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentGroupID } = useCurrentGroup();
  const [link, setLink] = useState(""); // Replace with your actual link
  const [copied, setCopied] = useState(false);
  const { allGroups } = useAllGroups();
  const currentGroup = allGroups?.find((item) => item.id === currentGroupID);

  useEffect(() => {
    if (currentGroupID) {
      const baseUrl = window.location.origin;

      setLink(
        `${baseUrl}/groups?groupName=${currentGroup?.title}&joinGroupId=${currentGroupID}`
      );
    }
  }, [currentGroupID]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Show 'Copied!' for 2 seconds
  };

  const open = Boolean(anchorEl);
  const id = open ? "share-link-popover" : undefined;

  return (
    <div>
      <IconButton onClick={handleClick} aria-label="Share link">
        <ShareIcon />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box p={2} minWidth={300}>
          <TextField
            size="small" // Makes the text field smaller
            variant="outlined"
            value={link}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <CopyToClipboard text={link} onCopy={handleCopy}>
                    <Button
                      variant="contained"
                      color={copied ? "success" : "primary"}
                      size="small" // Makes the button smaller
                      startIcon={<ContentCopyIcon />}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </CopyToClipboard>
                </InputAdornment>
              ),
            }}
            label="Group invite link"
          />
          <Typography
            variant="subtitle2"
            color="textSecondary"
            sx={{ padding: 1, marginBottom: -2 }}
          >
            Anyone with the link can join this group
          </Typography>
        </Box>
      </Popover>
    </div>
  );
};

export default ShareLinkPopover;
