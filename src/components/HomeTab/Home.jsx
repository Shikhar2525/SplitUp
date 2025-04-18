import React from "react";
import { Box, Grid, Paper, Typography, Button, Avatar, AvatarGroup, Chip } from "@mui/material";
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { calculateTotalsAcrossGroups } from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useAllGroups } from "../contexts/AllGroups";
import { useEffect, useState } from "react";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import { getCurrencySymbol } from "../utils";
import { useNavigate } from "react-router-dom";
import { useFriends } from "../contexts/FriendsContext";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PersonIcon from '@mui/icons-material/Person';
import PaidIcon from '@mui/icons-material/Paid';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import VerifiedIcon from '@mui/icons-material/Verified';
import PendingIcon from '@mui/icons-material/Pending';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import userService from "../services/user.service"; // Assuming userService is imported

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#5e72e4',
    maxWidth: 220,
    fontSize: '0.875rem',
    border: '1px solid rgba(94, 114, 228, 0.2)',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 8px 32px rgba(94, 114, 228, 0.15)',
    backdropFilter: 'blur(10px)',
    '& .amount-row': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 0',
      '&:not(:last-child)': {
        borderBottom: '1px dashed rgba(94, 114, 228, 0.2)'
      }
    }
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(255, 255, 255, 0.95)',
    '&::before': {
      border: '1px solid rgba(94, 114, 228, 0.2)'
    }
  },
}));

const Home = () => {
  const { currentUser } = useCurrentUser();
  const { allGroups } = useAllGroups();
  const { currentCurrency } = useCurrentCurrency();
  const { userFriends } = useFriends();
  const [totals, setTotals] = useState(null);
  const [totalFriends, setTotalFriends] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTotals = async () => {
      if (currentUser?.email && allGroups) {
        const result = await calculateTotalsAcrossGroups(
          allGroups,
          currentUser?.email,
          currentCurrency
        );
        setTotals(result);
      }
    };
    fetchTotals();
  }, [allGroups, currentUser, currentCurrency]);

  useEffect(() => {
    const getFriendCount = async () => {
      const user = await userService.getUserByEmail(currentUser?.email);
      const friendCount = user?.friends?.length || 0;
      setTotalFriends(friendCount);
    };

    if (currentUser?.email) {
      getFriendCount();
    }
  }, [currentUser?.email]);

  useEffect(() => {
    const storedCount = localStorage.getItem('myFriendsCount');
    if (storedCount) {
      setTotalFriends(parseInt(storedCount, 10));
    }
  }, []);

  const StatCard = ({ title, value, icon, color, onClick, hoverDetails }) => (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 2, // Reduced padding
        height: { sm: '100px' }, // Reduced height
        borderRadius: '24px',
        background: 'white',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
        '&:hover': onClick ? {
          transform: 'translateY(-5px)',
          boxShadow: '12px 12px 20px rgb(163,177,198,0.8), -12px -12px 20px rgba(255,255,255, 0.8)',
        } : {},
      }}
    >
      <StyledTooltip
        title={
          hoverDetails ? (
            <Box>
              <div className="amount-row">
                <Typography sx={{ fontWeight: 600, color: '#2dce89' }}>
                  You'll Get
                </Typography>
                <Typography sx={{ fontWeight: 600, color: '#2dce89' }}>
                  {getCurrencySymbol(currentCurrency)} {hoverDetails.youGet.toFixed(2)}
                </Typography>
              </div>
              <div className="amount-row">
                <Typography sx={{ fontWeight: 600, color: '#fb6340' }}>
                  You'll Give
                </Typography>
                <Typography sx={{ fontWeight: 600, color: '#fb6340' }}>
                  {getCurrencySymbol(currentCurrency)} {hoverDetails.youGive.toFixed(2)}
                </Typography>
              </div>
            </Box>
          ) : ''
        }
        arrow
        placement="top"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: '16px',
              bgcolor: `${color}15`,
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={700} color={color}>
              {typeof value === 'number' ? value : value}
            </Typography>
          </Box>
        </Box>
      </StyledTooltip>
    </Paper>
  );

  const RecentGroupCard = ({ group }) => {
    const isGroupSettled = group.members?.every(member => member.userSettled);

    return (
      <Paper
        elevation={0}
        onClick={() => {
          localStorage.setItem("currentGroupID", JSON.stringify(group?.id));
          navigate("/groups");
        }}
        sx={{
          p: 2,
          height: { xs: '180px', sm: '200px' }, // Fixed height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: '24px',
          background: 'white',
          position: 'relative',
          overflow: 'visible',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '12px 12px 20px rgb(163,177,198,0.8), -12px -12px 20px rgba(255,255,255, 0.8)',
          },
        }}
      >
        {/* Settlement Status Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -10,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderRadius: '12px',
            backgroundColor: isGroupSettled ? '#E8F5E9' : '#FFEBEE',
            color: isGroupSettled ? '#2E7D32' : '#C62828',
            border: `1px solid ${isGroupSettled ? '#A5D6A7' : '#FFCDD2'}`,
            boxShadow: '4px 4px 8px rgb(163,177,198,0.4), -4px -4px 8px rgba(255,255,255, 0.4)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isGroupSettled ? (
              <VerifiedIcon sx={{ fontSize: '0.875rem' }} />
            ) : (
              <PendingIcon sx={{ fontSize: '0.875rem' }} />
            )}
            <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
              {isGroupSettled ? 'Settled' : 'Unsettled'}
            </Typography>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          gap: 1
        }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'start', 
            gap: 2,
            mb: 1
          }}>
            <Avatar
              sx={{
                width: { xs: 40, sm: 45 },
                height: { xs: 40, sm: 45 },
                bgcolor: '#5e72e4',
                fontSize: '1.2rem',
                fontWeight: 600,
                flexShrink: 0
              }}
            >
              {group.title[0]}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="subtitle1" 
                fontWeight={600}
                sx={{
                  color: '#32325d',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {group.title}
              </Typography>
              {group.description && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#525f7f',
                    opacity: 0.9,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: '1.2',
                    fontSize: '0.8rem',
                    mt: 0.5
                  }}
                >
                  {group.description}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Stats Section */}
          <Box sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mt: 'auto' // Push to bottom
          }}>
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              backgroundColor: 'rgba(94, 114, 228, 0.1)',
              px: 1.5,
              py: 0.5,
              borderRadius: '8px'
            }}>
              <PaidIcon sx={{ color: '#5e72e4', fontSize: '0.9rem' }} />
              <Typography variant="caption" sx={{ 
                color: '#5e72e4',
                fontWeight: 600
              }}>
                {group.expenses?.length || 0} expenses
              </Typography>
            </Box>

            <Chip 
              label={group.category || 'Other'} 
              size="small"
              sx={{
                bgcolor: 'rgba(94, 114, 228, 0.1)',
                color: '#5e72e4',
                fontWeight: 600,
                height: '24px'
              }}
            />
          </Box>

          {/* Members Section */}
          <AvatarGroup 
            max={4} 
            sx={{ 
              '& .MuiAvatar-root': { 
                width: 28,
                height: 28,
                fontSize: '0.8rem',
                border: '2px solid #fff'
              }
            }}
          >
            {group.members?.map((member, idx) => (
              <Avatar 
                key={idx} 
                src={member.profilePicture} 
                alt={member.name}
              >
                {member.name?.[0]}
              </Avatar>
            ))}
          </AvatarGroup>
        </Box>
      </Paper>
    );
  };

  const BalanceBox = () => (
    <Box
      sx={{
        p: 3,
        borderRadius: '24px',
        background: 'white',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '12px 12px 20px rgb(163,177,198,0.8), -12px -12px 20px rgba(255,255,255, 0.8)',
        }
      }}
    >
      {/* Balance content */}
    </Box>
  );

  return (
    <Box sx={{ 
      height: 'auto',
      maxHeight: { xs: '100%', sm: '81vh' },
      overflow: { xs: 'auto', sm: 'hidden' },
      px: { xs: 2, sm: 2 },
      py: { xs: 2, sm: 2 }, // Reduced padding
      mt: { xs: 5, sm: 0 },
      backgroundColor: '#E0E5EC',
    }}>
      <Grid container spacing={2}> {/* Reduced spacing from 3 to 2 */}
        {/* Welcome Section with reduced margins */}
        <Grid item xs={12}>
          <Box sx={{ 
            mb: { xs: 2, sm: 2 }, // Reduced margin
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1, sm: 2 } // Reduced gap
          }}>
            {/* Welcome Text */}
            <Box>
              <Typography variant="h4" fontWeight={800} sx={{ 
                background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Welcome back, {currentUser?.name?.split(' ')[0]}!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Here's what's happening with your splitting journey.
              </Typography>
            </Box>

            {/* Balance Card */}
            <StatCard
              title="Overall Balance"
              value={`${Number(totals?.balance || 0).toFixed(2)} ${getCurrencySymbol(currentCurrency)} `}
              icon={<AccountBalanceIcon />}
              color={totals?.balance?.startsWith('-') ? '#fb6340' : '#2dce89'}
              hoverDetails={{
                youGet: Math.abs(totals?.youGet || 0),
                youGive: Math.abs(totals?.youGive || 0)
              }}
            />
          </Box>
        </Grid>

        {/* Stats Section */}
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Groups"
            value={allGroups?.length || 0}
            icon={<GroupAddIcon />}
            color="#5e72e4"
            onClick={() => navigate('/groups')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Friends"
            value={totalFriends}
            icon={<PersonIcon />}
            color="#2dce89"
            onClick={() => navigate('/friends')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Expenses"
            value={allGroups?.reduce((total, group) => total + (group.expenses?.length || 0), 0)}
            icon={<ReceiptLongIcon />}
            color="#fb6340"
          />
        </Grid>

        {/* Recent Groups Section with View All button */}
        <Grid item xs={12}>
          <Box sx={{ mt: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 2 } }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: { xs: 1, sm: 2 } // Reduced margin
            }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Groups
              </Typography>
              <Button
                variant="text"
                size="small"
                endIcon={<MoreHorizIcon />}
                onClick={() => navigate('/groups')}
                sx={{
                  color: '#5e72e4',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(94, 114, 228, 0.1)',
                  }
                }}
              >
                View All
              </Button>
            </Box>
            <Grid container spacing={2}> {/* Reduced spacing */}
              {allGroups?.slice(0, 3).map((group, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <RecentGroupCard group={group} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;