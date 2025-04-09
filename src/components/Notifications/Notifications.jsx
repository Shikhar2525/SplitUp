import React, { useEffect, useState } from "react";
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useNavigate } from 'react-router-dom';
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useCurrentGroup } from "../contexts/CurrentGroup"; // Add this import
import {
  convertCurrency,
  formatFirestoreTimestamp,
  sortLogsByDate,
} from "../utils";
import userService from "../services/user.service";

const Notifications = ({ logs = [], loader }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [activities, setActivities] = useState([]);
  const [readNotifications, setReadNotifications] = useState(() => {
    const saved = localStorage.getItem('readNotifications');
    return saved ? JSON.parse(saved) : [];
  });
  const { currentUser } = useCurrentUser();
  const { currentCurrency } = useCurrentCurrency();
  const { setCurrentGroupID } = useCurrentGroup(); // Add this
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    const newReadNotifications = [
      ...new Set([
        ...readNotifications,
        ...activities.map(activity => activity.id)
      ])
    ];
    setReadNotifications(newReadNotifications);
    localStorage.setItem('readNotifications', JSON.stringify(newReadNotifications));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const segregateActivities = (activities) => {
    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const newest = [];
    const older = [];

    activities.forEach(activity => {
      const activityDate = new Date(activity.date);
      if (activityDate > oneDayAgo) {
        newest.push(activity);
      } else {
        older.push(activity);
      }
    });

    return { newest, older };
  };

  const getNotificationsView = async () => {
    if (logs.length) {
      const sortedLogs = sortLogsByDate(logs);
      const processedActivities = await Promise.all(
        sortedLogs.map(async (log, index) => {
          if (log?.details?.performedBy?.email === currentUser?.email) {
            return null;
          }

          const isActionAboutMe = log?.details?.userAffected?.email === currentUser?.email;
          const isInSplitBetween = log?.details?.splitBetween?.includes(currentUser?.email);
          
          if (!isActionAboutMe && !isInSplitBetween && log?.logType !== "createGroup") {
            return null;
          }

          let description = "";
          let amountDescription = `${log?.details?.amount} Rs`;

          if (log?.logType === "addExpense" || log?.logType === "deleteExpense") {
            try {
              const { amount } = await convertCurrency(
                log?.details?.amount,
                log?.details?.currency,
                currentCurrency
              );
              amountDescription = `${amount} ${currentCurrency}`;
            } catch (error) {
              console.error("Currency conversion error:", error);
            }
          }

          const performedByName = log?.details.performedBy?.name;

          switch (log?.logType) {
            case "addExpense":
              description = `${performedByName} added an expense of ${amountDescription} for ${log.details.expenseTitle} in ${log?.details?.groupTitle}`;
              break;
            case "deleteExpense":
              description = `${performedByName} deleted an expense of ${amountDescription} for ${log.details.expenseTitle} in ${log?.details?.groupTitle}`;
              break;
            case "createGroup":
              description = `${performedByName} created group ${log?.details?.groupTitle}`;
              break;
            case "deleteGroup":
              description = `${performedByName} deleted group ${log?.details?.groupTitle}`;
              break;
            case "addUser":
              description = `${performedByName} added ${log.details.userAffected?.name} to ${log?.details?.groupTitle}`;
              break;
            case "deleteUser":
              description = `${performedByName} removed ${log.details.userAffected?.name} from ${log?.details?.groupTitle}`;
              break;
            case "settle":
              description = `${performedByName} settled all balances of ${log.details.userAffected?.name} in ${log?.details?.groupTitle}`;
              break;
            case "unSettle":
              description = `${performedByName} unsettled all balances of ${log.details.userAffected?.name} in ${log?.details?.groupTitle}`;
              break;
          }

          // Fetch complete user object for performer
          const performerUser = await userService.getUserByEmail(log?.details?.performedBy?.email);
          
          return description ? {
            id: index + 1,
            description,
            date: formatFirestoreTimestamp(log.details.date),
            groupId: log?.details?.groupId,
            performedBy: {
              ...performerUser,
              name: log?.details?.performedBy?.name,
              email: log?.details?.performedBy?.email
            }
          } : null;
        })
      );

      const filteredActivities = processedActivities.filter(activity => activity !== null);
      setActivities(filteredActivities);
    }
  };

  useEffect(() => {
    getNotificationsView();
  }, [logs, currentUser, currentCurrency]);

  const handleNotificationClick = (groupId) => {
    if (groupId) {
      localStorage.setItem("currentGroupID", JSON.stringify(groupId));
      setCurrentGroupID(groupId); // Set the current group ID
      navigate("/groups");
      handleClose();
    }
  };

  const unreadCount = activities.filter(
    activity => !readNotifications.includes(activity.id)
  ).length;

  return (
    <>
      <IconButton 
        onClick={handleClick}
        sx={{
          position: 'relative',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.1)',
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#FD7289',
              color: 'white',
              display: unreadCount === 0 ? 'none' : 'flex',
              minWidth: '20px',
              height: '20px',
              fontSize: '0.75rem',
              padding: '0 6px',
              boxShadow: '0 4px 12px rgba(253, 114, 137, 0.4)'
            }
          }}
        >
          <NotificationsIcon 
            sx={{ 
              color: '#5e72e4',
              fontSize: '28px',
              filter: 'drop-shadow(0 2px 4px rgba(94, 114, 228, 0.2))'
            }} 
          />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: { xs: 300, sm: 380 },
            maxHeight: 520,
            borderRadius: '20px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }
        }}
      >
        <Box 
          sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Typography variant="caption" sx={{ 
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.2)',
              px: 1.5,
              py: 0.5,
              borderRadius: 10,
              fontSize: '0.75rem'
            }}>
              {unreadCount} new
            </Typography>
          )}
        </Box>
        
        <Box sx={{ 
          maxHeight: 450, 
          overflowY: 'auto',
          overflowX: 'hidden',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(94, 114, 228, 0.2)',
            borderRadius: '3px',
          }
        }}>
          {loader ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} color="primary" />
            </Box>
          ) : activities.length > 0 ? (
            <>
              {(() => {
                const { newest, older } = segregateActivities(activities);
                return (
                  <>
                    {newest.length > 0 && (
                      <>
                        <Typography
                          sx={{
                            px: 2.5,
                            py: 1.5,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#8898aa',
                            backgroundColor: 'rgba(94, 114, 228, 0.05)',
                          }}
                        >
                          New
                        </Typography>
                        {newest.map((activity, index) => (
                          <Box key={activity.id}>
                            <Box
                              onClick={() => handleNotificationClick(activity.groupId)}
                              sx={{
                                p: 2.5,
                                cursor: activity.groupId ? 'pointer' : 'default',
                                display: 'flex',
                                gap: 2,
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                '&:hover': activity.groupId ? { 
                                  backgroundColor: 'rgba(94, 114, 228, 0.05)',
                                  transform: 'translateX(4px)'
                                } : {},
                              }}
                            >
                              <Avatar 
                                src={activity.performedBy?.profilePicture}
                                alt={activity.performedBy?.name}
                                sx={{ 
                                  width: 45, 
                                  height: 45,
                                  boxShadow: '0 4px 12px rgba(94, 114, 228, 0.15)'
                                }}
                              >
                                {activity.performedBy?.name?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#32325d',
                                    fontWeight: !readNotifications.includes(activity.id) ? 600 : 400,
                                    lineHeight: 1.5,
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {activity.description}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#8898aa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.8,
                                    mt: 0.5
                                  }}
                                >
                                  {!readNotifications.includes(activity.id) && (
                                    <FiberManualRecordIcon sx={{ 
                                      fontSize: 8, 
                                      color: '#5e72e4'
                                    }} />
                                  )}
                                  {activity.date}
                                </Typography>
                              </Box>
                            </Box>
                            {index < newest.length - 1 && (
                              <Divider sx={{ opacity: 0.1 }} />
                            )}
                          </Box>
                        ))}
                      </>
                    )}
                    {older.length > 0 && (
                      <>
                        <Typography
                          sx={{
                            px: 2.5,
                            py: 1.5,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#8898aa',
                            backgroundColor: 'rgba(94, 114, 228, 0.05)',
                            borderTop: '1px solid rgba(0,0,0,0.05)',
                          }}
                        >
                          Earlier
                        </Typography>
                        {older.map((activity, index) => (
                          <Box key={activity.id}>
                            <Box
                              onClick={() => handleNotificationClick(activity.groupId)}
                              sx={{
                                p: 2.5,
                                cursor: activity.groupId ? 'pointer' : 'default',
                                display: 'flex',
                                gap: 2,
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                '&:hover': activity.groupId ? { 
                                  backgroundColor: 'rgba(94, 114, 228, 0.05)',
                                  transform: 'translateX(4px)'
                                } : {},
                              }}
                            >
                              <Avatar 
                                src={activity.performedBy?.profilePicture}
                                alt={activity.performedBy?.name}
                                sx={{ 
                                  width: 45, 
                                  height: 45,
                                  boxShadow: '0 4px 12px rgba(94, 114, 228, 0.15)'
                                }}
                              >
                                {activity.performedBy?.name?.charAt(0)}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#32325d',
                                    fontWeight: !readNotifications.includes(activity.id) ? 600 : 400,
                                    lineHeight: 1.5,
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {activity.description}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: '#8898aa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.8,
                                    mt: 0.5
                                  }}
                                >
                                  {!readNotifications.includes(activity.id) && (
                                    <FiberManualRecordIcon sx={{ 
                                      fontSize: 8, 
                                      color: '#5e72e4'
                                    }} />
                                  )}
                                  {activity.date}
                                </Typography>
                              </Box>
                            </Box>
                            {index < older.length - 1 && (
                              <Divider sx={{ opacity: 0.1 }} />
                            )}
                          </Box>
                        ))}
                      </>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              color: '#8898aa'
            }}>
              <NotificationsIcon sx={{ 
                fontSize: 48, 
                color: 'rgba(94, 114, 228, 0.2)',
                mb: 1
              }} />
              <Typography variant="body2">
                No new notifications
              </Typography>
            </Box>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default Notifications;
