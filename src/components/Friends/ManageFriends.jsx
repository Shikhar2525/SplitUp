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
  Tooltip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { InfoOutlined } from "@mui/icons-material";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import userService from "../services/user.service";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useFriends } from "../contexts/FriendsContext";

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

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 60,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#5e72e4',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#5e72e4',
    width: 32,
    height: 32,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4c8',
    borderRadius: 20 / 2,
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
  const [isLoading, setIsLoading] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const { refreshFriends } = useFriends();

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const user = await userService.getUserByEmail(currentUser?.email);
      
      if (!user || !user.friends) {
        setMyFriends([]);
        return;
      }

      const friendPromises = user.friends.map((friendEmail) =>
        userService.getUserByEmail(friendEmail)
      );

      const friendsData = await Promise.all(friendPromises);
      const validFriends = friendsData.filter((friend) => friend !== null);
      setMyFriends(validFriends);
      
      // Store in localStorage for consistent access
      localStorage.setItem('myFriendsCount', validFriends.length.toString());
    } catch (error) {
      console.error("Error fetching friends:", error);
      setMyFriends([]);
    } finally {
      setIsLoading(false);
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
  }, [currentUser?.email, refreshFriends]);

  useEffect(() => {
    const fetchUserVisibility = async () => {
      const user = await userService.getUserByEmail(currentUser?.email);
      setIsHidden(user?.isHidden || false);
    };
    if (currentUser?.email) {
      fetchUserVisibility();
    }
  }, [currentUser]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery || !currentUser) return [];
    
    return allUsers
      .filter(user => {
        const isNotCurrentUser = user.email !== currentUser.email;
        const isNotHidden = user.isHidden !== true;
        const isNotFriend = !myFriends.some(friend => friend.email === user.email);
        const matchesSearch = 
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase());

        return isNotCurrentUser && isNotHidden && isNotFriend && matchesSearch;
      })
      .slice(0, 5);
  }, [searchQuery, allUsers, myFriends, currentUser]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setAnchorEl(event.currentTarget);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  const handleVisibilityChange = async (event) => {
    const newHiddenState = event.target.checked;
    setIsHidden(newHiddenState);
    await userService.updateUserVisibility(currentUser?.email, newHiddenState);
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
        await refreshFriends(currentUser.email);
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
        await refreshFriends(currentUser.email);
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
        {/* Updated header layout */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 3 },
          alignItems: { xs: 'center', sm: 'flex-start' },
          justifyContent: 'space-between',
          textAlign: { xs: 'center', sm: 'left' },
        }}>
          {/* Title and Count Section */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' }
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
                px: { xs: 2, sm: 2 },
                py: { xs: 0.5, sm: 0.5 },
                borderRadius: 2,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                fontWeight: 600,
                minWidth: '80px',
              }}
            >
              {myFriends.length} total
            </Typography>
          </Box>

          {/* Controls Section */}
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <FormControlLabel
              control={<CustomSwitch checked={isHidden} onChange={handleVisibilityChange} />}
              label={
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#5e72e4',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  Hide Me
                </Box>
              }
              sx={{
                m: 0,
                border: '1px dashed rgba(94, 114, 228, 0.3)',
                borderRadius: 2,
                padding: '4px 12px',
                transition: 'all 0.2s ease',
                width: { xs: '100%', sm: 'auto' },
                justifyContent: 'center',
                '&:hover': {
                  backgroundColor: 'rgba(94, 114, 228, 0.05)',
                  borderColor: 'rgba(94, 114, 228, 0.5)',
                }
              }}
            />

            <Tooltip title="People added here can't see you as a friend. This list is just for your convenience when creating groups.">
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                backgroundColor: 'rgba(94, 114, 228, 0.1)',
                px: 2.5,
                py: 1,
                borderRadius: 2,
                cursor: 'help',
                width: { xs: '100%', sm: 'auto' },
                justifyContent: 'center',
                border: '1px dashed rgba(94, 114, 228, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(94, 114, 228, 0.15)',
                  border: '1px dashed rgba(94, 114, 228, 0.5)',
                }
              }}>
                <InfoOutlined sx={{ color: '#5e72e4', fontSize: 18 }} />
                <Typography sx={{ color: '#5e72e4', fontWeight: 600, fontSize: '0.875rem' }}>
                  Info
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ mt: { xs: 3, sm: 4 } }}>
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
                          display: 'flex',
                          flexWrap: 'nowrap',
                          gap: 1,
                          pr: { xs: 1, sm: 2 }, // Reduced padding on mobile
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: { xs: 45, sm: 56 } }}>
                          <Avatar
                            src={user.profilePicture || ""}
                            alt={user.name}
                            sx={{
                              width: { xs: 35, sm: 40 },
                              height: { xs: 35, sm: 40 },
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
                          sx={{
                            flex: '1 1 auto',
                            minWidth: 0, // Enable text truncation
                            '& .MuiListItemText-primary': {
                              fontWeight: 600,
                              fontSize: { xs: '0.85rem', sm: '0.9rem' },
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            },
                            '& .MuiListItemText-secondary': {
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }
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
                            minWidth: { xs: '60px', sm: '100px' },
                            px: { xs: 1, sm: 2 },
                            ml: { xs: 0.5, sm: 2 },
                            borderColor: isAlreadyFriend(user.email) ? "#82C7A4" : "#5E72E4",
                            color: isAlreadyFriend(user.email) ? "#82C7A4" : "#5E72E4",
                            '& .MuiButton-startIcon': {
                              margin: { xs: '0', sm: '-4px 8px -4px 0' }
                            },
                            '& .MuiButton-startIcon > *:nth-of-type(1)': {
                              fontSize: { xs: '1.2rem', sm: '1.3rem' }
                            },
                            "&:hover": {
                              borderColor: isAlreadyFriend(user.email) ? "#82C7A4" : "#4B54B9",
                              backgroundColor: isAlreadyFriend(user.email) 
                                ? "rgba(130, 199, 164, 0.05)" 
                                : "rgba(94, 114, 228, 0.05)",
                            },
                          }}
                        >
                          {addingFriendMap[user.email] ? "..." : 
                           isAlreadyFriend(user.email) ? 
                           <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Added</Box> : 
                           <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Add</Box>}
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
          {isLoading ? (
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px'
              }}
            >
              <CircularProgress 
                size={40}
                sx={{ color: '#5e72e4' }}
              />
            </Box>
          ) : myFriends.length > 0 ? (
            myFriends.map((friend) => (
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
            ))
          ) : (
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
