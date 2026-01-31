import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Typography, Paper, Grid, TextField, Button,
    Divider, List, ListItem, ListItemIcon, ListItemText, Drawer,
    CircularProgress, Container, Chip, Tabs, Tab, InputAdornment,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton
} from '@mui/material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ExploreIcon from '@mui/icons-material/Explore';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import HistoryIcon from '@mui/icons-material/History';

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

function Dashboard() {
    // --- State ---
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [tickers, setTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState('RELIANCE.NS');
    const [quote, setQuote] = useState(null);
    const [history, setHistory] = useState([]);
    const [news, setNews] = useState([]);
    const [trades, setTrades] = useState([]);
    const [watchlist, setWatchlist] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('1mo');
    const [tab, setTab] = useState(0); // 0: Explore, 1: Investments, 2: Watchlist, 3: History
    const [quantity, setQuantity] = useState(1);

    // --- Data Fetching ---
    const fetchData = async () => {
        try {
            const [statusRes, tickersRes, tradesRes, watchlistRes] = await Promise.all([
                axios.get('/api/status'),
                axios.get('/api/tickers'),
                axios.get('/api/trades'),
                axios.get('/api/watchlist')
            ]);
            setStatus(statusRes.data);
            setTickers(tickersRes.data.tickers || tickersRes.data);
            setTrades(tradesRes.data);
            setWatchlist(watchlistRes.data.watchlist || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data", err);
        }
    };

    const fetchStockDetails = async () => {
        if (!selectedTicker) return;
        try {
            const [quoteRes, historyRes, newsRes] = await Promise.all([
                axios.get(`/api/quote/${selectedTicker}`),
                axios.get(`/api/history/${selectedTicker}?period=${selectedPeriod}`),
                axios.get(`/api/news/${selectedTicker}`)
            ]);
            setQuote(quoteRes.data);

            const historyData = Array.isArray(historyRes.data) ? historyRes.data : historyRes.data.data;
            setHistory(historyData.map(d => ({ date: d.date, close: d.close })));
            setNews(newsRes.data);
        } catch (err) {
            console.error("Error fetching stock details", err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchStockDetails();
    }, [selectedTicker, selectedPeriod]);

    // --- Actions ---
    const handleTrade = async (action) => {
        try {
            const endpoint = action === 'BUY' ? '/api/buy' : '/api/sell';
            await axios.post(endpoint, {
                ticker: selectedTicker,
                quantity: parseInt(quantity),
                action: action,
                order_type: 'MARKET'
            });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.detail || "Trade failed");
        }
    };

    const toggleWatchlist = async () => {
        try {
            const isWatched = watchlist.includes(selectedTicker);
            if (isWatched) {
                await axios.delete(`/api/watchlist/${selectedTicker}`);
            } else {
                await axios.post(`/api/watchlist/${selectedTicker}`);
            }
            const res = await axios.get('/api/watchlist');
            setWatchlist(res.data.watchlist || []);
        } catch (err) {
            console.error(err);
        }
    };

    const resetGame = async () => {
        if (window.confirm("Are you sure you want to reset everything?")) {
            await axios.post('/api/reset');
            window.location.reload();
        }
    };

    const filteredTickers = (tickers || []).filter(t =>
        t.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (status?.ticker_names?.[t] && status.ticker_names[t].toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading || !status) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor={COLORS.bg}><CircularProgress sx={{ color: COLORS.primary }} /></Box>;
    }

    return (
        <Box sx={{ display: 'flex', bgcolor: COLORS.bg, minHeight: '100vh' }}>
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
                    {[
                        { text: 'Explore', icon: <ExploreIcon />, id: 0 },
                        { text: 'Holdings', icon: <BusinessCenterIcon />, id: 1 },
                        { text: 'Watchlist', icon: <StarIcon />, id: 2 },
                        { text: 'History', icon: <HistoryIcon />, id: 3 },
                    ].map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            onClick={() => setTab(item.id)}
                            sx={{
                                borderRadius: '12px', mb: 1,
                                bgcolor: tab === item.id ? '#e8fdf8' : 'transparent',
                                color: tab === item.id ? COLORS.primary : COLORS.textSec,
                                '&:hover': { bgcolor: '#f7fafc', color: COLORS.text },
                                '& .MuiListItemIcon-root': { color: tab === item.id ? COLORS.primary : COLORS.textSec, minWidth: 40 }
                            }}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: tab === item.id ? '700' : '600', variant: 'body2' }} />
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ my: 2, mx: 2 }} />
                <List sx={{ px: 2 }}>
                    <ListItem button onClick={() => window.location.href = '/commodities'} sx={{ borderRadius: '12px', color: COLORS.textSec, '&:hover': { bgcolor: '#f7fafc', color: COLORS.text }, '& .MuiListItemIcon-root': { minWidth: 40, color: 'inherit' } }}>
                        <ListItemIcon><MonetizationOnIcon /></ListItemIcon>
                        <ListItemText primary="Commodities" primaryTypographyProps={{ fontWeight: '600', variant: 'body2' }} />
                    </ListItem>
                </List>
                <Box sx={{ mt: 'auto', p: 2 }}>
                    <Button fullWidth size="small" variant="outlined" onClick={resetGame} sx={{ color: COLORS.textSec, borderColor: COLORS.border, textTransform: 'none' }}>Reset Game</Button>
                </Box>
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                    <TextField
                        placeholder="Search stocks..."
                        size="small"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: COLORS.textSec }} /></InputAdornment> }}
                        sx={{ width: 400, bgcolor: 'white', '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                    <Paper elevation={0} sx={{ p: 1, px: 3, display: 'flex', alignItems: 'center', gap: 3, border: `1px solid ${COLORS.border}`, borderRadius: '12px' }}>
                        <Box>
                            <Typography variant="caption" sx={{ color: COLORS.textSec, fontWeight: 'bold' }}>CREDITS</Typography>
                            <Typography variant="subtitle1" fontWeight="800">₹{status.balance.toLocaleString('en-IN')}</Typography>
                        </Box>
                        <Divider orientation="vertical" flexItem />
                        <Box>
                            <Typography variant="caption" sx={{ color: COLORS.textSec, fontWeight: 'bold' }}>PNL</Typography>
                            <Typography variant="subtitle1" fontWeight="800" sx={{ color: status.pnl >= 0 ? COLORS.primary : COLORS.negative }}>{status.pnl >= 0 ? '+' : ''}₹{Math.abs(status.pnl).toLocaleString('en-IN')}</Typography>
                        </Box>
                    </Paper>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        {tab === 0 && (
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: `1px solid ${COLORS.border}` }}>
                                <Box display="flex" justifyContent="space-between" mb={4}>
                                    <Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="h4" fontWeight="800">{selectedTicker.replace('.NS', '')}</Typography>
                                            <IconButton onClick={toggleWatchlist} size="small">{watchlist.includes(selectedTicker) ? <StarIcon sx={{ color: '#FFD700' }} /> : <StarBorderIcon />}</IconButton>
                                        </Box>
                                        <Typography variant="body1" sx={{ color: COLORS.textSec }}>{quote?.name}</Typography>
                                    </Box>
                                    <Box textAlign="right">
                                        <Typography variant="h4" fontWeight="800">₹{quote?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
                                        <Typography variant="body2" sx={{ color: COLORS.primary, fontWeight: 'bold' }}>Live NSE</Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ height: 320, my: 4 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={history}>
                                            <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.15} /><stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} /></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="date" hide />
                                            <YAxis domain={['auto', 'auto']} orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.textSec }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                                            <Area type="monotone" dataKey="close" stroke={COLORS.primary} strokeWidth={3} fill="url(#colorPrice)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                                <Box display="flex" gap={1}>
                                    {['1D', '1W', '1M', '1Y'].map(p => (
                                        <Button key={p} onClick={() => setSelectedPeriod(p.toLowerCase().replace('w', '5d'))} sx={{ borderRadius: '8px', bgcolor: selectedPeriod === p.toLowerCase().replace('w', '5d') ? '#e8fdf8' : 'transparent', color: selectedPeriod === p.toLowerCase().replace('w', '5d') ? COLORS.primary : COLORS.textSec, fontWeight: '700' }}>{p}</Button>
                                    ))}
                                </Box>
                                <Box mt={5}>
                                    <Typography variant="h6" fontWeight="800" gutterBottom>News</Typography>
                                    {news.map((n, i) => (
                                        <Box key={i} mb={2} sx={{ cursor: 'pointer' }} onClick={() => window.open(n.link || n.content?.clickThroughUrl?.url, '_blank')}>
                                            <Typography variant="subtitle2" fontWeight="700">{n.title || n.content?.title}</Typography>
                                            <Typography variant="caption" sx={{ color: COLORS.textSec }}>{n.publisher || "Finance News"}</Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Paper>
                        )}
                        {(tab === 1 || tab === 2) && (
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: `1px solid ${COLORS.border}` }}>
                                <Typography variant="h5" fontWeight="800" mb={3}>{tab === 1 ? 'Your Investments' : 'Watchlist'}</Typography>
                                <TableContainer>
                                    <Table>
                                        <TableHead><TableRow><TableCell sx={{ fontWeight: 'bold' }}>STOCK</TableCell><TableCell align="right" sx={{ fontWeight: 'bold' }}>{tab === 1 ? 'QUANTITY' : 'PRICE'}</TableCell></TableRow></TableHead>
                                        <TableBody>
                                            {(tab === 1 ? Object.entries(status.holdings) : watchlist.map(t => [t, 'Explore'])).map(([t, val]) => (
                                                <TableRow key={t} button onClick={() => { setSelectedTicker(t); setTab(0); }} sx={{ cursor: 'pointer' }}>
                                                    <TableCell><Typography fontWeight="700">{t.replace('.NS', '')}</Typography><Typography variant="caption">{status.ticker_names?.[t]}</Typography></TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{val}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        )}
                        {tab === 3 && (
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', border: `1px solid ${COLORS.border}` }}>
                                <Typography variant="h5" fontWeight="800" mb={3}>History</Typography>
                                {trades.slice().reverse().map((t, i) => (
                                    <Box key={i} mb={2} p={2} sx={{ bgcolor: '#f7fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                        <Box><Typography fontWeight="700">{t.ticker.replace('.NS', '')}</Typography><Typography variant="caption">{t.date}</Typography></Box>
                                        <Box textAlign="right"><Typography fontWeight="700" sx={{ color: t.action === 'BUY' ? COLORS.primary : COLORS.negative }}>{t.action} {t.quantity}</Typography><Typography variant="caption">@ ₹{t.price}</Typography></Box>
                                    </Box>
                                ))}
                            </Paper>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: '20px', border: `1px solid ${COLORS.border}` }}>
                            <Typography variant="h6" fontWeight="800" mb={3}>Order</Typography>
                            <Box sx={{ border: `1px solid ${COLORS.border}`, borderRadius: '12px', p: 0.5, mb: 3, display: 'flex' }}>
                                <Button fullWidth onClick={() => handleTrade('BUY')} sx={{ bgcolor: COLORS.primary, color: 'white', fontWeight: 'bold', borderRadius: '8px', py: 1.5, '&:hover': { bgcolor: '#00b889' } }}>BUY</Button>
                                <Button fullWidth onClick={() => handleTrade('SELL')} sx={{ color: COLORS.negative, fontWeight: 'bold', borderRadius: '8px' }}>SELL</Button>
                            </Box>
                            <TextField fullWidth type="number" label="Quantity" size="small" value={quantity} onChange={(e) => setQuantity(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                            <Divider sx={{ my: 3 }} />
                            <Box display="flex" justifyContent="space-between" mb={1}><Typography variant="body2">Order Value</Typography><Typography variant="body2" fontWeight="bold">₹{(quantity * (quote?.price || 0)).toLocaleString()}</Typography></Box>
                            <Box display="flex" justifyContent="space-between"><Typography variant="body2">Balance</Typography><Typography variant="body2" fontWeight="bold">₹{status.balance.toLocaleString()}</Typography></Box>
                        </Paper>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: `1px solid ${COLORS.border}`, maxHeight: 400, overflowY: 'auto' }}>
                            <Typography variant="subtitle2" fontWeight="800" mb={2}>All Stocks</Typography>
                            {filteredTickers.map(t => (
                                <Box key={t} onClick={() => setSelectedTicker(t)} sx={{ p: 1, mb: 0.5, cursor: 'pointer', borderRadius: '8px', bgcolor: selectedTicker === t ? '#e8fdf8' : 'transparent' }}>
                                    <Typography variant="body2" fontWeight="700" sx={{ color: selectedTicker === t ? COLORS.primary : COLORS.text }}>{t.replace('.NS', '')}</Typography>
                                    <Typography variant="caption" sx={{ color: COLORS.textSec }}>{status.ticker_names?.[t]}</Typography>
                                </Box>
                            ))}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default Dashboard;
