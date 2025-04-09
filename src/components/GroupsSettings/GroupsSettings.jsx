const GroupsSettings = ({ groupID, groupName, defaultCurrency }) => {
  // ...existing imports and state...

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        "&::-webkit-scrollbar": {
          width: "8px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(94, 114, 228, 0.2)",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: "rgba(94, 114, 228, 0.05)",
          borderRadius: "4px",
        }
      }}
    >
      {/* ...existing settings content... */}
    </Box>
  );
};

export default GroupsSettings;
