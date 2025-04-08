import { Box, Paper, Typography, Avatar, AvatarGroup, Chip } from '@mui/material';
import PaidIcon from '@mui/icons-material/Paid';
import PendingIcon from '@mui/icons-material/Pending';
import VerifiedIcon from '@mui/icons-material/Verified';
import { useNavigate } from 'react-router-dom';

const GroupCard = ({ group }) => {
  const navigate = useNavigate();
  const isSettled = group.members?.every(member => member.userSettled);

  return (
    <Paper
      elevation={0}
      onClick={() => navigate(`/groups/${group.id}`)}
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
        overflow: 'visible',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 32px rgba(94, 114, 228, 0.15)',
        },
      }}
    >
      {/* Settlement Status Badge */}
      <Chip
        icon={isSettled ? <VerifiedIcon /> : <PendingIcon />}
        label={isSettled ? "Settled" : "Pending"}
        sx={{
          position: 'absolute',
          top: -10,
          right: 20,
          backgroundColor: isSettled ? 'rgba(45, 206, 137, 0.1)' : 'rgba(251, 99, 64, 0.1)',
          color: isSettled ? '#2dce89' : '#fb6340',
          fontWeight: 600,
          '& .MuiSvgIcon-root': {
            fontSize: '1rem'
          },
          border: `1px solid ${isSettled ? 'rgba(45, 206, 137, 0.2)' : 'rgba(251, 99, 64, 0.2)'}`,
        }}
      />

      {/* Group Content */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: '#5e72e4',
              fontSize: '1.4rem',
              fontWeight: 600
            }}
          >
            {group.title[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {group.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.members?.length} members
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={group.category || 'Other'} 
            size="small"
            sx={{
              bgcolor: 'rgba(94, 114, 228, 0.1)',
              color: '#5e72e4',
              fontWeight: 600
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
            <PaidIcon sx={{ color: '#8898aa', fontSize: '1rem' }} />
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {group.expenses?.length || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      <AvatarGroup 
        max={4} 
        sx={{ 
          mt: 2,
          '& .MuiAvatar-root': { 
            width: 32, 
            height: 32, 
            fontSize: '0.875rem',
            border: '2px solid #fff'
          } 
        }}
      >
        {group.members?.map((member, idx) => (
          <Avatar 
            key={idx} 
            src={member.profilePicture} 
            alt={member.name}
            sx={{
              bgcolor: member.userSettled ? '#2dce89' : undefined
            }}
          >
            {member.name?.[0]}
          </Avatar>
        ))}
      </AvatarGroup>
    </Paper>
  );
};

export default GroupCard;
