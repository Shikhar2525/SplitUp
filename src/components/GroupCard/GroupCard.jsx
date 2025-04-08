import { Box, Card, CardContent, Typography, Avatar, Chip } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils";
import HomeIcon from "@mui/icons-material/Home";
import FlightIcon from "@mui/icons-material/Flight";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CategoryIcon from "@mui/icons-material/Category";

function GroupCard({ group }) {
  const navigate = useNavigate();

  const getCategoryInfo = (category) => {
    switch(category?.toLowerCase()) {
      case 'home':
        return {
          icon: <HomeIcon sx={{ fontSize: '1.2rem' }} />,
          color: '#2dce89',
          gradient: 'linear-gradient(135deg, #2dce89 0%, #2fcca0 100%)'
        };
      case 'trip':
        return {
          icon: <FlightIcon sx={{ fontSize: '1.2rem' }} />,
          color: '#fb6340',
          gradient: 'linear-gradient(135deg, #fb6340 0%, #fbb140 100%)'
        };
      case 'couple':
        return {
          icon: <FavoriteIcon sx={{ fontSize: '1.2rem' }} />,
          color: '#f5365c',
          gradient: 'linear-gradient(135deg, #f5365c 0%, #f56036 100%)'
        };
      default:
        return {
          icon: <CategoryIcon sx={{ fontSize: '1.2rem' }} />,
          color: '#5e72e4',
          gradient: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)'
        };
    }
  };

  const categoryInfo = getCategoryInfo(group.category);

  return (
    <Card
      onClick={() => {
        localStorage.setItem("currentGroupID", JSON.stringify(group.id));
        navigate("/groups");
      }}
      sx={{
        position: "relative",
        borderRadius: "24px",
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8))',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.8)',
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: '0 8px 32px rgba(94, 114, 228, 0.1)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 40px rgba(94, 114, 228, 0.2)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Category Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1,
            borderRadius: '12px',
            background: categoryInfo.gradient,
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
        >
          {categoryInfo.icon}
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {group.category || 'Other'}
          </Typography>
        </Box>

        {/* Title and Description */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#32325d',
              fontSize: '1.1rem',
              mb: 1
            }}
          >
            {group.title}
          </Typography>
          {group.description && (
            <Typography
              variant="body2"
              sx={{
                color: '#525f7f',
                fontSize: '0.875rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {group.description}
            </Typography>
          )}
        </Box>

        {/* Stats */}
        <Box sx={{ 
          display: 'flex',
          gap: 2,
          mb: 2
        }}>
          <Chip
            label={`${group.members?.length || 0} members`}
            size="small"
            sx={{
              backgroundColor: 'rgba(94, 114, 228, 0.1)',
              color: '#5e72e4',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
          <Chip
            label={`${group.expenses?.length || 0} expenses`}
            size="small"
            sx={{
              backgroundColor: 'rgba(45, 206, 137, 0.1)',
              color: '#2dce89',
              fontWeight: 600,
              fontSize: '0.75rem'
            }}
          />
        </Box>

        {/* Footer */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 2,
          borderTop: '1px solid rgba(94, 114, 228, 0.1)',
        }}>
          <Typography
            variant="caption"
            sx={{
              color: '#8898aa',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            Created {formatDate(group.createdDate)}
          </Typography>
          <Avatar
            src={group.admin?.profilePicture}
            alt={group.admin?.name}
            sx={{
              width: 24,
              height: 24,
              fontSize: '0.75rem',
              bgcolor: '#5e72e4'
            }}
          >
            {group.admin?.name?.[0]}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
}

export default GroupCard;
