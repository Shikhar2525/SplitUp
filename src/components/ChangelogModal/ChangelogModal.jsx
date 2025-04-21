import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import NewReleasesIcon from '@mui/icons-material/NewReleases';

const ChangelogModal = ({ open, onClose }) => {
  const changes = [
    {
      type: 'Major Features',
      icon: <RocketLaunchIcon sx={{ color: '#5e72e4' }} />,
      items: [
        'Real-time Updates - Changes sync instantly across all users without refresh',
        'Notes Tab - Add important information and reminders for your group',
        'Friends System - Search and add friends directly within the app',
        'Privacy Controls - Option to hide yourself from search results',
        'Smart Expense Splitting - Option to exclude payer from split calculations'
      ]
    },
    {
      type: 'UI Improvements',
      icon: <AutoFixHighIcon sx={{ color: '#2dce89' }} />,
      items: [
        'Redesigned interface for better user experience',
        'Enhanced mobile responsiveness across all screens',
        'Improved notifications system with real-time updates',
        'New friends management interface with search functionality',
        'Smoother animations and transitions throughout the app'
      ]
    },
    {
      type: 'Other Updates',
      icon: <NewReleasesIcon sx={{ color: '#fb6340' }} />,
      items: [
        'Live status indicator showing real-time sync',
        'Improved group expense calculations',
        'Enhanced data synchronization',
        'Better error handling and feedback',
        'Optimized app performance'
      ]
    }
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(10px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#32325d' }}>
            What's New in SplitUp 2.0
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#8898aa', mb: 3 }}>
          We've made significant improvements to enhance your experience
        </Typography>
        {changes.map((section, index) => (
          <Box key={section.type} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              {section.icon}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#32325d' }}>
                {section.type}
              </Typography>
            </Box>
            <List dense>
              {section.items.map((item, i) => (
                <ListItem key={i} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={item}
                    sx={{
                      '& .MuiListItemText-primary': {
                        color: '#525f7f',
                        fontSize: '0.9rem'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
            {index < changes.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#5e72e4',
            '&:hover': { bgcolor: '#4b5cc4' },
            borderRadius: '8px',
            px: 3
          }}
        >
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangelogModal;
