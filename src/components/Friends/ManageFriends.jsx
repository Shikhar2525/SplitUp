import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Button,
  InputAdornment,
  Paper,
  Fade,
  styled,
  Popper,
  ClickAwayListener,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { InfoOutlined } from "@mui/icons-material";
import userService from "../services/user.service";
import { useCurrentUser } from "../contexts/CurrentUser";

const StyledSearchResults = styled(Box)(({ theme }) => ({
  width: "100%",
  maxHeight: "300px",
  overflowY: "auto",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  padding: "8px 0",
}));

const ManageFriends = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingRequest, setProcessingRequest] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser } = useCurrentUser();
  const [addingFriendMap, setAddingFriendMap] = useState({});
  const [myFriends, setMyFriends] = useState([]);
  const [removingFriend, setRemovingFriend] = useState(null);

  const fetchFriends = async () => {
    try {
      const user = await userService.getUserByEmail(currentUser.email);
      if (!user || !user.friends) return;

      const friendPromises = user.friends.map((friendEmail) =>
        userService.getUserByEmail(friendEmail)
      );

      const friendsData = await Promise.all(friendPromises);
      setMyFriends(friendsData.filter((friend) => friend !== null));
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser?.email) {
      fetchFriends();
    }
  }, [currentUser]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return allUsers
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .slice(0, 5);
  }, [searchQuery, allUsers]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl) && searchQuery.length > 0;

  const getInitials = (name) => {
    if (!name) return "?";
    const names = name.split(" ");
    return names.map((n) => n.charAt(0).toUpperCase()).join("");
  };

  const handleAddFriend = async (friendEmail) => {
    try {
      setAddingFriendMap((prev) => ({ ...prev, [friendEmail]: true }));
      const result = await userService.addFriend(currentUser.email, friendEmail);

      if (result.success) {
        console.log(result.message);
        await fetchFriends();
        setSearchQuery(""); // Clear search bar
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error adding friend:", error);
    } finally {
      setAddingFriendMap((prev) => ({ ...prev, [friendEmail]: false }));
      setAnchorEl(null);
    }
  };

  const handleRemoveFriend = async (friendEmail) => {
    try {
      console.log("Attempting to remove friend:", friendEmail);
      setRemovingFriend(friendEmail);
      
      const result = await userService.removeFriend(currentUser.email, friendEmail);
      console.log("Remove friend result:", result);
      
      if (result.success) {
        console.log("Friend removed, refreshing list...");
        await fetchFriends();
      } else {
        console.error("Failed to remove friend:", result.message);
      }
    } catch (error) {
      console.error("Error in handleRemoveFriend:", error);
    } finally {
      setRemovingFriend(null);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: { xs: 2, md: 4 },
        backgroundColor: "#f8f9fe",
        overflowY: "auto",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, #fff 0%, #f8f9fe 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            sx={{
              color: "#2C3E50",
              fontWeight: 900,
              background: "linear-gradient(135deg, #5E72E4 0%, #825EE4 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            My Friends
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlined sx={{ color: '#8898aa', fontSize: 16 }} />
            <Typography variant="caption" sx={{ color: '#8898aa', fontStyle: 'italic' }}>
              Personal reference list only
            </Typography>
          </Box>
        </Box>
      </Paper>

      <ClickAwayListener onClickAway={handleClickAway}>
        <Box sx={{ position: "relative", width: "100%" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              mb: open ? 0 : 3,
              width: "100%",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "white",
                borderRadius: "8px 8px",
                borderBottomLeftRadius: open ? 0 : "8px",
                borderBottomRightRadius: open ? 0 : "8px",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                },
                "&.Mui-focused": {
                  boxShadow: "0 4px 20px rgba(94, 114, 228, 0.15)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          {open && (
            <StyledSearchResults>
              {filteredUsers.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 3,
                    px: 2,
                    textAlign: "center",
                    color: "#525F7F",
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    No users found matching "{searchQuery}"
                  </Typography>
                </Box>
              ) : (
                filteredUsers.map((user) => (
                  <ListItem
                    key={user.id}
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(94, 114, 228, 0.05)",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={user.profilePicture || ""}
                        alt={user.name}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "2px solid #E8E8E8",
                          bgcolor: "#2C3E50",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "1rem",
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={user.email}
                      primaryTypographyProps={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                      secondaryTypographyProps={{
                        fontSize: "0.8rem",
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        addingFriendMap[user.email] ? (
                          <CircularProgress size={16} color="primary" />
                        ) : (
                          <PersonAddIcon />
                        )
                      }
                      onClick={() => handleAddFriend(user.email)}
                      disabled={addingFriendMap[user.email]}
                      sx={{
                        ml: 2,
                        minWidth: "100px",
                        borderColor: "#5E72E4",
                        color: "#5E72E4",
                        "&:hover": {
                          borderColor: "#4B54B9",
                          backgroundColor: "rgba(94, 114, 228, 0.05)",
                        },
                      }}
                    >
                      {addingFriendMap[user.email] ? "Adding..." : "Add"}
                    </Button>
                  </ListItem>
                ))
              )}
            </StyledSearchResults>
          )}
        </Box>
      </ClickAwayListener>

      <Fade in={true}>
        <List sx={{ width: "100%", gap: 2 }}>
          {myFriends.map((friend) => (
            <ListItem
              key={friend.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveFriend(friend.email)}
                  disabled={removingFriend === friend.email}
                  sx={{
                    color: "#F5365C",
                    opacity: 1,
                    transition: "all 0.2s ease-in-out",
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      backgroundColor: "rgba(245, 54, 92, 0.05)",
                    },
                  }}
                >
                  {removingFriend === friend.email ? (
                    <CircularProgress size={20} color="error" />
                  ) : (
                    <PersonRemoveIcon />
                  )}
                </IconButton>
              }
              sx={{
                mb: 2,
                backgroundColor: "white",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  backgroundColor: "rgba(94, 114, 228, 0.05)",
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={friend.profilePicture || ""}
                  alt={friend.name}
                  sx={{
                    width: 50,
                    height: 50,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                    border: "3px solid white",
                  }}
                >
                  {getInitials(friend.name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={friend.name}
                secondary={friend.email}
                primaryTypographyProps={{
                  fontWeight: 600,
                  color: "#32325d",
                }}
                secondaryTypographyProps={{
                  color: "#525F7F",
                }}
              />
            </ListItem>
          ))}
          {myFriends.length === 0 && (
            <Box sx={{ textAlign: "center", py: 4, color: "#525F7F" }}>
              <Typography>No friends added yet</Typography>
            </Box>
          )}
        </List>
      </Fade>
    </Box>
  );
};

export default ManageFriends;
