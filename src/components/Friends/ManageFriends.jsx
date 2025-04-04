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
  maxHeight: { xs: "250px", sm: "300px" },
  overflowY: "auto",
  backgroundColor: "white",
  borderRadius: "0 0 24px 24px",
  boxShadow: "0 8px 32px rgba(94, 114, 228, 0.1)",
  backdropFilter: "blur(10px)",
  padding: "8px 0",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(94, 114, 228, 0.2)",
    borderRadius: "4px",
  },
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

  const isAlreadyFriend = (email) => {
    return myFriends.some(friend => friend.email === email);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        p: { xs: 1.5, sm: 2, md: 4 },
        mt: { xs: 2, sm: 0 },
      }}
    >
      {/* Fixed Header Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: "16px", sm: "24px" },
          background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 8px 32px rgba(94, 114, 228, 0.1)",
          mb: 4,
          border: "1px solid rgba(255,255,255,0.8)",
          flexShrink: 0, // Prevent header from shrinking
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 2, sm: 0 },
          justifyContent: 'space-between' 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 }
          }}>
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                color: "#2C3E50",
                fontWeight: 800,
                background: "linear-gradient(135deg, #5E72E4 0%, #825EE4 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              My Friends
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#8898aa',
                backgroundColor: 'rgba(94, 114, 228, 0.1)',
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.25, sm: 0.5 },
                borderRadius: 2,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 600,
              }}
            >
              {myFriends.length} total
            </Typography>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: 'rgba(136, 152, 170, 0.1)',
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              borderRadius: 2
            }}
          >
            <InfoOutlined sx={{ color: '#8898aa', fontSize: { xs: 12, sm: 14 } }} />
            <Typography variant="caption" sx={{ color: '#8898aa', fontWeight: 500, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              Personal reference list only
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ position: "relative", width: "100%" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add friends by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "rgba(255,255,255,0.8)",
                    backdropFilter: "blur(10px)",
                    borderRadius: open ? "24px 24px 0 0" : "24px",
                    transition: "all 0.2s ease-in-out",
                    height: "60px",
                    border: "1px solid rgba(94, 114, 228, 0.1)",
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(94, 114, 228, 0.15)",
                      backgroundColor: "rgba(255,255,255,0.95)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 20px rgba(94, 114, 228, 0.2)",
                      backgroundColor: "white",
                    },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8898aa' }} />
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
                              isAlreadyFriend(user.email) ? null : <PersonAddIcon />
                            )
                          }
                          onClick={() => handleAddFriend(user.email)}
                          disabled={addingFriendMap[user.email] || isAlreadyFriend(user.email)}
                          sx={{
                            ml: 2,
                            minWidth: "100px",
                            borderColor: isAlreadyFriend(user.email) ? "#82C7A4" : "#5E72E4",
                            color: isAlreadyFriend(user.email) ? "#82C7A4" : "#5E72E4",
                            "&:hover": {
                              borderColor: isAlreadyFriend(user.email) ? "#82C7A4" : "#4B54B9",
                              backgroundColor: isAlreadyFriend(user.email) 
                                ? "rgba(130, 199, 164, 0.05)" 
                                : "rgba(94, 114, 228, 0.05)",
                            },
                            cursor: isAlreadyFriend(user.email) ? "default" : "pointer",
                          }}
                        >
                          {addingFriendMap[user.email] ? "Adding..." : 
                           isAlreadyFriend(user.email) ? "Added" : "Add"}
                        </Button>
                      </ListItem>
                    ))
                  )}
                </StyledSearchResults>
              )}
            </Box>
          </ClickAwayListener>
        </Box>
      </Paper>

      {/* Scrollable Friends List */}
      <Fade in={true}>
        <List 
          sx={{ 
            width: "100%", 
            gap: { xs: 1, sm: 2 },
            flexGrow: 1,
            overflowY: "auto",
            maxHeight: {
              xs: "calc(100vh - 380px)",
              sm: "calc(100vh - 400px)",
              md: "calc(100vh - 420px)"
            },
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
            },
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(94, 114, 228, 0.2) rgba(94, 114, 228, 0.05)"
          }}
        >
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
                mb: { xs: 1, sm: 2 },
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
                backdropFilter: "blur(10px)",
                borderRadius: { xs: "16px", sm: "24px" },
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 4px 16px rgba(94, 114, 228, 0.1)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 32px rgba(94, 114, 228, 0.2)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
                },
                p: { xs: 1.5, sm: 2 },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={friend.profilePicture || ""}
                  alt={friend.name}
                  sx={{
                    width: { xs: 40, sm: 50 },
                    height: { xs: 40, sm: 50 },
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
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  noWrap: true,
                  sx: {
                    maxWidth: { xs: '140px', sm: '200px', md: 'none' }
                  }
                }}
                secondaryTypographyProps={{
                  color: "#525F7F",
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  noWrap: true,
                  sx: {
                    maxWidth: { xs: '140px', sm: '200px', md: 'none' }
                  }
                }}
                sx={{
                  minWidth: 0, // Enable text truncation
                  mr: { xs: 1, sm: 2 } // Add margin for remove button
                }}
              />
            </ListItem>
          ))}
          {myFriends.length === 0 && (
            <Box 
              sx={{ 
                textAlign: "center", 
                py: 8,
                background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)",
                backdropFilter: "blur(10px)",
                borderRadius: "24px",
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 4px 16px rgba(94, 114, 228, 0.1)",
              }}
            >
              <Typography variant="h6" sx={{ color: '#8898aa', fontWeight: 500 }}>
                No friends added yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#8898aa', mt: 1 }}>
                Search for users above to add them to your friends list
              </Typography>
            </Box>
          )}
        </List>
      </Fade>
    </Box>
  );
};

export default ManageFriends;
