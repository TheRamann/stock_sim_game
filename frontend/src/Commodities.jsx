import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Grid, Divider, List, ListItem,
    ListItemIcon, ListItemText, Drawer, CircularProgress,
    Container, Chip, IconButton, Card, CardContent
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ExploreIcon from '@mui/icons-material/Explore';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HistoryIcon from '@mui/icons-material/History';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const drawerWidth = 240;

const COLORS = {
    bg: '#F4F7F9',
    sidebar: '#FFFFFF',
    paper: '#FFFFFF',
    primary: '#00D09C', // Groww Green
    negative: '#EB5B3C', // Groww Red
    text: '#2D3748',
    textSec: '#718096',
    border: '#E2E8F0',
};

function Commodities() {
    const [commodities, setCommodities] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [commRes, watchRes] = await Promise.all([
                axios.get('/api/commodities'),
                axios.get('/api/watchlist')
            ]);
            setCommodities(commRes.data.commodities || []);
            setWatchlist(watchRes.data.watchlist || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching commodities:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const toggleWatchlist = async (ticker) => {
        try {
            if (watchlist.includes(ticker)) {
                await axios.delete(`/api/watchlist/${ticker}`);
            } else {
                await axios.post(`/api/watchlist/${ticker}`);
            }
            const res = await axios.get('/api/watchlist');
            setWatchlist(res.data.watchlist || []);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={COLORS.bg}><CircularProgress sx={{ color: COLORS.primary }} /></Box>;
    }

    return (
        <Box sx={{ display: 'flex', bgcolor: COLORS.bg, minHeight: '100vh' }}>
            {/* Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: COLORS.sidebar, borderRight: `1px solid ${COLORS.border}` },
                }}
            >
                <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, bgcolor: COLORS.primary, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <TrendingUpIcon />
                    </Box>
                    <Typography variant="h6" fontWeight="800" sx={{ color: COLORS.text, letterSpacing: '-0.5px' }}>GrowwSim</Typography>
                </Box>
                <List sx={{ px: 2, mt: 2 }}>
                    <ListItem button onClick={() => window.location.href = '/'} sx={{ borderRadius: '12px', mb: 1, color: COLORS.textSec, '&:hover': { bgcolor: '#f7fafc', color: COLORS.text } }}>
                        <ListItemIcon><ExploreIcon /></ListItemIcon>
                        <ListItemText primary="Stocks Explore" primaryTypographyProps={{ fontWeight: '600', variant: 'body2' }} />
                    </ListItem>
                </List>
                <Divider sx={{ my: 2, mx: 2 }} />
                <List sx={{ px: 2 }}>
                    <ListItem button sx={{ borderRadius: '12px', bgcolor: '#e8fdf8', color: COLORS.primary }}>
                        <ListItemIcon><MonetizationOnIcon sx={{ color: COLORS.primary }} /></ListItemIcon>
                        <ListItemText primary="Commodities" primaryTypographyProps={{ fontWeight: '700', variant: 'body2' }} />
                    </ListItem>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="800" sx={{ color: COLORS.text }}>Global Commodities</Typography>
                        <Typography variant="body2" sx={{ color: COLORS.textSec }}>Real-time benchmarks in USD</Typography>
                    </Box>
                    <Chip label="LIVE FEED" sx={{ bgcolor: COLORS.primary, color: 'white', fontWeight: 'bold' }} />
                </Box>

                <Grid container spacing={3}>
                    {commodities.map((comm) => {
                        const isUp = comm.change_pct >= 0;
                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={comm.ticker}>
                                <Card elevation={0} sx={{
                                    borderRadius: '20px',
                                    border: `1px solid ${COLORS.border}`,
                                    transition: '0.2s',
                                    '&:hover': { transform: 'translateY(-4px)', borderColor: COLORS.primary, boxShadow: '0 8px 24px rgba(0,0,0,0.05)' }
                                }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box display="flex" justifyContent="space-between" mb={2}>
                                            <Box>
                                                <Typography variant="caption" sx={{ color: COLORS.textSec, fontWeight: 'bold' }}>{comm.ticker}</Typography>
                                                <Typography variant="h6" fontWeight="800">{comm.name}</Typography>
                                            </Box>
                                            <IconButton onClick={() => toggleWatchlist(comm.ticker)} size="small">
                                                {watchlist.includes(comm.ticker) ? <StarIcon sx={{ color: '#FFD700' }} /> : <StarBorderIcon sx={{ color: COLORS.border }} />}
                                            </IconButton>
                                        </Box>

                                        <Box mb={2}>
                                            <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5 }}>
                                                ${comm.price?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                                {isUp ? <TrendingUpIcon sx={{ color: COLORS.primary, fontSize: 16 }} /> : <TrendingDownIcon sx={{ color: COLORS.negative, fontSize: 16 }} />}
                                                <Typography variant="body2" fontWeight="bold" sx={{ color: isUp ? COLORS.primary : COLORS.negative }}>
                                                    {isUp ? '+' : ''}{comm.change_pct}%
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ my: 2, opacity: 0.5 }} />
                                        <Typography variant="caption" sx={{ color: COLORS.textSec, fontWeight: '600' }}>{comm.unit}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
        </Box>
    );
}

export default Commodities;
