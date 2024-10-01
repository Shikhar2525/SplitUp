import { Box, Button } from "@mui/material";
import React, { useState } from "react";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteGroupModal from "../DeleteGroupModal/DeleteGroupModal"; // Adjust the path according to your structure

function GroupsSettings({ groupID, groupName }) {
  const isMobile = useScreenSize();
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box
      sx={{ height: "53vh", overflow: "auto", paddingRight: isMobile ? 1 : 2 }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleOpenModal}
        sx={{
          backgroundColor: "#FD7289",
          color: "#FFF",
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderRadius: "8px",
        }}
      >
        <DeleteForeverIcon />
        Delete Group
      </Button>

      {/* Confirmation Modal */}
      <DeleteGroupModal
        open={openModal}
        onClose={handleCloseModal}
        groupId={groupID} // Pass the group ID
        groupName={groupName} // Pass the group name
      />
    </Box>
  );
}

export default GroupsSettings;
