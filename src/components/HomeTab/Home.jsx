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

  const StatCard = ({ title, value, icon, color, onClick, hoverDetails }) => (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.8)',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        '&:hover': onClick ? {
          transform: 'translateY(-5px)',
          boxShadow: '0 8px 32px rgba(94, 114, 228, 0.15)',
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

  const RecentGroupCard = React.memo(({ group }) => {
    const isGroupSettled = group.members?.every(member => member.userSettled);

    return (
      <Paper
        elevation={0}
        onClick={() => navigate('/groups')}
        sx={{
          p: 2.5,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.8) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.8)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 8px 32px rgba(94, 114, 228, 0.15)',
          },
        }}
      >
        {/* Add Settlement Status Badge */}
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
            backgroundColor: isGroupSettled ? 'rgba(45, 206, 137, 0.1)' : 'rgba(251, 99, 64, 0.1)',
            color: isGroupSettled ? '#2dce89' : '#fb6340',
            border: `1px solid ${isGroupSettled ? 'rgba(45, 206, 137, 0.2)' : 'rgba(251, 99, 64, 0.2)'}`,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.3s ease',
            zIndex: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.1)',
            }
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

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'start', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 45,
                  height: 45,
                  bgcolor: '#5e72e4',
                  fontSize: '1.2rem',
                  fontWeight: 600
                }}
              >
                {group.title[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {group.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {group.members?.length} members
                </Typography>
              </Box>
            </Box>
          </Box>
          <Chip 
            label={group.category || 'Other'} 
            size="small"
            sx={{
              bgcolor: 'rgba(94, 114, 228, 0.1)',
              color: '#5e72e4',
              fontWeight: 600
            }}
          />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mt: 2 
        }}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.8rem' } }}>
            {group.members?.map((member, idx) => (
              <Avatar key={idx} src={member.profilePicture} alt={member.name}>
                {member.name?.[0]}
              </Avatar>
            ))}
          </AvatarGroup>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaidIcon sx={{ color: '#8898aa', fontSize: '1.1rem' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {group.expenses?.length || 0} expenses
            </Typography>
          </Box>
        </Box>
      </Paper>
    );
  });

  return (
    <Box sx={{ 
      height: '81vh',
      overflow: 'auto',
      px: { xs: 2, sm: 3 },
      py: { xs: 2, sm: 3 },
      mt: { xs: 5, sm: 0 }, // Added margin top for mobile
      '&::-webkit-scrollbar': {
        width: '6px'
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(94, 114, 228, 0.2)',
        borderRadius: '10px'
      }
    }}>
      <Grid container spacing={3}>
        {/* Welcome and Balance Section */}
        <Grid item xs={12}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 3,
            mb: 3
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
              value={`${getCurrencySymbol(currentCurrency)} ${Math.abs(totals?.balance || 0).toFixed(2)}`}
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
            value={userFriends?.length || 0}
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
            color="#11cdef"
          />
        </Grid>

        {/* Recent Groups Section */}
        <Grid item xs={12}>
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Recent Groups
            </Typography>
            <Grid container spacing={3}>
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
