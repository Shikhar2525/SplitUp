import { Box, Grid, Typography, Card } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import OverViewCard from "../OverViewCard/OverViewCard";
import { useScreenSize } from "../contexts/ScreenSizeContext";
import GroupCard from "../GroupCard/GroupCard";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import { useAllGroups } from "../contexts/AllGroups";
import { calculateTotalsAcrossGroups, capitalizeFirstLetter } from "../utils";
import { useCurrentUser } from "../contexts/CurrentUser";
import { useNavigate } from "react-router-dom";
import activityService from "../services/activity.service";
import { useCurrentCurrency } from "../contexts/CurrentCurrency";
import { useRefetchLogs } from "../contexts/RefetchLogs";
import Button from '@mui/material/Button';
import PaymentsIcon from '@mui/icons-material/Payments';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

function HomeTab() {
  const isMobile = useScreenSize();
  const { allGroups } = useAllGroups();
  const { currentUser } = useCurrentUser();
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const { currentCurrency } = useCurrentCurrency();
  const [totals, setTotals] = useState({
    youGet: 0,
    youGive: 0,
    balance: 0,
  });
  const { refetchLogs } = useRefetchLogs();

  useEffect(() => {
    if (allGroups?.length > 0 && currentUser) {
      const fetchTotals = async () => {
        const result = await calculateTotalsAcrossGroups(
          allGroups,
          currentUser.email,
          currentCurrency
        );
        setTotals(result);
      };

      fetchTotals();
    } else {
      // If no groups or currentUser, reset the totals
      setTotals({
        youGet: 0,
        youGive: 0,
        balance: 0,
      });
    }
  }, [allGroups, currentUser, currentCurrency]);

  const { youGet, youGive, balance } = totals;

  const fetchLogs = async () => {
    setLoader(true);
    try {
      const fetchedLogs = await activityService.fetchActivitiesByEmail(
        currentUser?.email
      );
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoader(false);
    }
  };
  useEffect(() => {
    if (currentUser) {
      fetchLogs();
    }
  }, [currentUser, refetchLogs]);

  return (
    <Box sx={{ flex: 1, display: "flex", width: "100%" }}>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          marginTop: 2,
          gap: 3, // Add consistent gap between sections
          ...(isMobile ? { alignItems: "flex-start" } : {}),
        }}
      >
        {/* Summary Section */}
        <Typography variant="subtitle1" margin={0.5} sx={{ color: "#353E6C" }}>
          Summary
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <OverViewCard
              title={"You get"}
              amount={youGet}
              backgroundStyle={{
                background: "linear-gradient(135deg, #f36, #f08)",
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <OverViewCard
              title={"You give"}
              amount={youGive}
              backgroundStyle={{
                background: "linear-gradient(135deg, #FF9A3E, #FF6F20)",
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <OverViewCard
              title={"Balance"}
              amount={balance}
              backgroundStyle={{
                background: "linear-gradient(135deg, #332A7C, #5A4B9A)",
              }}
            />
          </Grid>
        </Grid>

        {/* Recent Groups Section */}
        {allGroups?.length > 0 && (
          <>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "#353E6C" }}
                >
                  Recent Groups
                </Typography>
                <Typography
                  onClick={() => navigate("/groups")}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#5e72e4',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      color: '#4B54B9'
                    }
                  }}
                >
                  View All <ArrowRightAltIcon />
                </Typography>
              </Box>
              <Grid container spacing={3} justifyContent="flex-start">
                {allGroups?.slice(0, 3).map((group) => (
                  <Grid item xs={12} sm={6} md={4} key={group.id}>
                    <GroupCard group={group} />
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Promotional Banner */}
            <Box
              sx={{
                width: "100%",
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
                boxShadow: '0 8px 32px rgba(94, 114, 228, 0.2)',
                mt: 2,
                mb: 3
              }}
            >
              <Card
                sx={{
                  background: 'linear-gradient(135deg, #5e72e4 0%, #825ee4 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    p: { xs: 2, sm: 3 },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: { xs: 2, sm: 3 },
                    height: '100%',
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {/* Text Content */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        mb: 1,
                        textAlign: { xs: 'center', sm: 'left' }
                      }}
                    >
                      Track Your Group Expenses
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        mb: { xs: 1, sm: 2 },
                        maxWidth: '600px',
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        textAlign: { xs: 'center', sm: 'left' }
                      }}
                    >
                      Split bills, track expenses, and settle up with your friends easily.
                    </Typography>
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    onClick={() => navigate("/groups")}
                    sx={{
                      backgroundColor: 'white',
                      color: '#5e72e4',
                      px: 3,
                      py: 1,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                      },
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    View All Groups
                  </Button>
                </Box>

                {/* Decorative Elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.1,
                    background: `
                      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)
                    `,
                  }}
                />
              </Card>
            </Box>

            {/* Enhanced Banner */}
            <Box
              sx={{
                width: "100%",
                mx: { xs: 1, sm: 2 },
                mb: 3,
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                background: 'linear-gradient(135deg, #1a1f35 0%, #212744 100%)',
                boxShadow: '0 8px 32px rgba(26, 31, 53, 0.2)',
              }}
            >
              {/* Animated Background Pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0.1,
                  background: `
                    repeating-linear-gradient(45deg,
                      transparent,
                      transparent 10px,
                      rgba(255,255,255,0.1) 10px,
                      rgba(255,255,255,0.1) 20px
                    )
                  `,
                  animation: 'movePattern 20s linear infinite',
                  '@keyframes movePattern': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(100px)' }
                  }
                }}
              />

              <Box
                sx={{
                  p: { xs: 3, sm: 4 },
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 4, sm: 6 },
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {/* Content Section */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: { xs: '1.75rem', sm: '2rem' },
                      mb: 1,
                      background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Manage Group Expenses
                  </Typography>

                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      mb: 4,
                      maxWidth: '500px',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      lineHeight: 1.6
                    }}
                  >
                    Create groups, track expenses, and split bills easily with your friends and family.
                  </Typography>

                  {/* Stats Grid */}
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                    mb: 4
                  }}>
                    {[
                      {
                        icon: <GroupsIcon />,
                        label: 'Active Groups',
                        value: allGroups.length,
                        color: '#5e72e4'
                      },
                      {
                        icon: <AssignmentIcon />,
                        label: 'Total Expenses',
                        value: allGroups.reduce((acc, group) => acc + (group.expenses?.length || 0), 0),
                        color: '#2dce89'
                      },
                      {
                        icon: <AccountBalanceWalletIcon />,
                        label: 'Settlements',
                        value: allGroups.reduce((acc, group) => 
                          acc + (group.members?.filter(m => m.userSettled)?.length || 0), 0),
                        color: '#fb6340'
                      }
                    ].map((stat, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          borderRadius: '16px',
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(255,255,255,0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <Box sx={{
                          p: 1.5,
                          borderRadius: '12px',
                          backgroundColor: `${stat.color}20`,
                          color: stat.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {stat.icon}
                        </Box>
                        <Box>
                          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', mb: 0.5 }}>
                            {stat.label}
                          </Typography>
                          <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '1.25rem' }}>
                            {stat.value}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    onClick={() => navigate("/groups")}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      bgcolor: '#5e72e4',
                      color: 'white',
                      px: 3,
                      py: 1.5,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&:hover': {
                        bgcolor: '#4757ca',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(94, 114, 228, 0.4)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Manage Groups
                  </Button>
                </Box>

                {/* Illustration Section */}
                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40%',
                    position: 'relative'
                  }}
                >
                  <Box
                    component="img"
                    src="https://assets-v2.lottiefiles.com/a/ebf42e44-116a-11ee-aa38-87cc876a2b24/tYZI9ybSOr.gif"
                    alt="Expense Management"
                    sx={{
                      width: '100%',
                      maxWidth: '400px',
                      height: 'auto',
                      objectFit: 'contain',
                      filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.2))',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default HomeTab;
