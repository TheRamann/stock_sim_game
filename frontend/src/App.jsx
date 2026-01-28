import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Container, Grid, Paper, Typography, Button,
    FormControl, TextField, Autocomplete,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tab, Tabs, CircularProgress, Chip
} from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Groww-inspired theme colors
const COLORS = {
    bg: '#f5f5f5',
    paper: '#ffffff',
    primary: '#00d09c',
    success: '#00d09c',
    danger: '#eb5b3c',
    text: '#44475b',
    textSec: '#7c7e8c',
    border: '#e5e5e5',
    lightGreen: '#e8f5f1'
};

function App() {
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState(null);
    const [tickers, setTickers] = useState([]);
    const [selectedTicker, setSelectedTicker] = useState('RELIANCE.NS');
    const [quote, setQuote] = useState(null);
    const [history, setHistory] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [tabInfo, setTabInfo] = useState(0);
    const [trades, setTrades] = useState([]);
    const [error, setError] = useState('');
    const [selectedPeriod, setSelectedPeriod] = useState('1mo');
    const [news, setNews] = useState([]);
    const [orderType, setOrderType] = useState('MARKET');
    const [limitPrice, setLimitPrice] = useState('');
    const [pendingOrders, setPendingOrders] = useState([]);

    useEffect(() => {
        fetchInitialData();
        const interval = setInterval(() => {
            handleNextTick();
        }, 5000); // Auto refresh every 5s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (status?.current_date) {
            fetchQuote();
            fetchHistory();
            fetchTrades();
            fetchNews();
            fetchOrders();
        }
    }, [selectedTicker, status?.current_date, selectedPeriod]);

    const fetchNews = async () => {
        try {
            const res = await axios.get(`/api/news/${selectedTicker}`);
            setNews(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/api/orders');
            setPendingOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchInitialData = async () => {
        try {
            const statusRes = await axios.get('/api/status');
            const tickersRes = await axios.get('/api/tickers');
            setStatus(statusRes.data);
            setTickers(tickersRes.data.tickers);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching initial data", err);
            setLoading(false);
        }
    };

    const fetchQuote = async () => {
        try {
            const res = await axios.get(`/api/quote/${selectedTicker}`);
            setQuote(res.data);
        } catch (err) {
            console.error(err);
            setQuote(null);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`/api/history/${selectedTicker}?period=${selectedPeriod}`);
            const formatted = res.data.map(d => ({
                date: d.date,
                price: d.close
            }));
            setHistory(formatted);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTrades = async () => {
        try {
            const res = await axios.get('/api/trades');
            setTrades(res.data.reverse());
        } catch (err) {
            console.error(err);
        }
    }

    const handleNextTick = async () => {
        try {
            const res = await axios.post('/api/next_tick');
            setStatus(res.data);
        } catch (err) {
            setError('Failed to refresh');
        }
    };

    const handleTrade = async (action) => {
        try {
            const endpoint = action === 'BUY' ? '/api/buy' : '/api/sell';
            const payload = {
                ticker: selectedTicker,
                quantity: parseInt(quantity),
                action: action,
                order_type: orderType,
                price: orderType === 'LIMIT' ? parseFloat(limitPrice) : null
            };
            const res = await axios.post(endpoint, payload);
            setStatus(res.data.status);
            setError('');
            fetchTrades();
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.detail || 'Trade failed');
        }
    };

    const resetGame = async () => {
        if (window.confirm("Restart game?")) {
            await axios.post('/api/reset');
            window.location.reload();
        }
    };

    if (loading && !status) return <Box p={4} sx={{ bgcolor: COLORS.bg, minHeight: '100vh' }}><CircularProgress sx={{ color: COLORS.primary }} /></Box>;

    return (
        <Box sx={{ bgcolor: COLORS.bg, minHeight: '100vh', pb: 4 }}>
            {/* Header */}
            <Paper elevation={0} sx={{ bgcolor: COLORS.paper, borderBottom: `1px solid ${COLORS.border}`, py: 2, px: 3 }}>
                <Container maxWidth="lg">
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Typography variant="h5" fontWeight="600" sx={{ color: COLORS.text }}>
                            Stock Simulator
                        </Typography>
                        <Box display="flex" gap={2} alignItems="center">
                            {/* Search Bar in Header */}
                            <Autocomplete
                                value={null} // Don't keep value, just for searching
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                        const originalTicker = tickers.find(t => t.replace('.NS', '') === newValue);
                                        if (originalTicker) setSelectedTicker(originalTicker);
                                    }
                                }}
                                options={tickers.map(t => t.replace('.NS', ''))}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search stocks..."
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            width: 250,
                                            bgcolor: COLORS.bg,
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: COLORS.border },
                                                '&:hover fieldset': { borderColor: COLORS.primary },
                                                '&.Mui-focused fieldset': { borderColor: COLORS.primary },
                                            }
                                        }}
                                    />
                                )}
                                disableClearable
                                sx={{ mr: 2 }}
                            />
                            <Typography variant="body2" sx={{ color: COLORS.textSec }}>
                                {status?.current_date}
                            </Typography>
                            <Button
                                size="small"
                                onClick={resetGame}
                                sx={{
                                    color: COLORS.textSec,
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: COLORS.lightGreen }
                                }}
                            >
                                Reset
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Paper>

            <Container maxWidth="lg" sx={{ mt: 3 }}>
                {/* Portfolio Summary */}
                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ color: COLORS.textSec, mb: 1 }}>Total Value</Typography>
                            <Typography variant="h4" fontWeight="600" sx={{ color: COLORS.text, mb: 1 }}>
                                ₹{status?.total_value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: status?.pnl >= 0 ? COLORS.success : COLORS.danger,
                                    fontWeight: 500
                                }}
                            >
                                {status?.pnl >= 0 ? '+' : ''}₹{Math.abs(status?.pnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                ({status?.pnl >= 0 ? '+' : ''}{((status?.pnl / 100000) * 100).toFixed(2)}%)
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
                            <Typography variant="body2" sx={{ color: COLORS.textSec, mb: 1 }}>Available Cash</Typography>
                            <Typography variant="h4" fontWeight="600" sx={{ color: COLORS.text }}>
                                ₹{status?.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    {/* Chart & Trading */}
                    <Grid item xs={12} md={8}>
                        <Paper elevation={0} sx={{ p: 3, bgcolor: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 2, mb: 2 }}>
                            {/* Stock Title */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h5" fontWeight="600" sx={{ color: COLORS.text }}>
                                    {selectedTicker.replace('.NS', '')}
                                </Typography>
                                <Box textAlign="right">
                                    <Typography variant="h5" fontWeight="600" sx={{ color: COLORS.text }}>
                                        ₹{quote?.price.toFixed(2)}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Period Buttons */}
                            <Box display="flex" gap={1} mb={3}>
                                {['1d', '5d', '1mo', '6mo'].map(period => (
                                    <Button
                                        key={period}
                                        size="small"
                                        onClick={() => setSelectedPeriod(period)}
                                        sx={{
                                            minWidth: '50px',
                                            textTransform: 'uppercase',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            bgcolor: selectedPeriod === period ? COLORS.lightGreen : 'transparent',
                                            color: selectedPeriod === period ? COLORS.primary : COLORS.textSec,
                                            border: 'none',
                                            '&:hover': {
                                                bgcolor: COLORS.lightGreen
                                            }
                                        }}
                                    >
                                        {period}
                                    </Button>
                                ))}
                            </Box>

                            {/* Chart */}
                            <Box height={300} mb={3}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.1} />
                                                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="date"
                                            hide={false}
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: COLORS.textSec, fontSize: 12 }}
                                            tickFormatter={(str) => {
                                                if (!str) return '';
                                                if (selectedPeriod === '1d') {
                                                    return str.split(' ')[1]?.substring(0, 5) || '';
                                                }
                                                return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                            }}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            hide
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: COLORS.paper,
                                                border: "none",
                                                borderRadius: 8,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                            }}
                                            itemStyle={{ color: COLORS.text, fontWeight: 600 }}
                                            labelStyle={{ color: COLORS.textSec, marginBottom: 4 }}
                                        />
                                        {history.length > 0 && (
                                            <ReferenceLine
                                                y={history[0].price}
                                                stroke={COLORS.textSec}
                                                strokeDasharray="3 3"
                                                strokeOpacity={0.5}
                                            />
                                        )}
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke={COLORS.success}
                                            fillOpacity={1}
                                            fill="url(#colorPrice)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>

                            {/* Trading Controls */}
                            <Box display="flex" flexDirection="column" gap={2} mb={2}>
                                <Box display="flex" gap={2}>
                                    <Button
                                        size="small"
                                        variant={orderType === 'MARKET' ? 'contained' : 'outlined'}
                                        onClick={() => setOrderType('MARKET')}
                                        sx={{ bgcolor: orderType === 'MARKET' ? COLORS.primary : 'transparent', color: orderType === 'MARKET' ? '#fff' : COLORS.text }}
                                    >
                                        Market
                                    </Button>
                                    <Button
                                        size="small"
                                        variant={orderType === 'LIMIT' ? 'contained' : 'outlined'}
                                        onClick={() => setOrderType('LIMIT')}
                                        sx={{ bgcolor: orderType === 'LIMIT' ? COLORS.primary : 'transparent', color: orderType === 'LIMIT' ? '#fff' : COLORS.text }}
                                    >
                                        Limit
                                    </Button>
                                </Box>
                                {orderType === 'LIMIT' && (
                                    <TextField
                                        label="Limit Price (₹)"
                                        type="number"
                                        variant="outlined"
                                        size="small"
                                        value={limitPrice}
                                        onChange={(e) => setLimitPrice(e.target.value)}
                                    />
                                )}
                            </Box>
                            <Box display="flex" gap={2} alignItems="center">
                                <TextField
                                    label="Quantity"
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    sx={{
                                        width: 120,
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: COLORS.border },
                                            '&:hover fieldset': { borderColor: COLORS.primary },
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleTrade('BUY')}
                                    sx={{
                                        bgcolor: COLORS.primary,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        '&:hover': { bgcolor: '#00b889' }
                                    }}
                                >
                                    Buy
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => handleTrade('SELL')}
                                    sx={{
                                        color: COLORS.danger,
                                        borderColor: COLORS.danger,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        px: 4,
                                        '&:hover': {
                                            borderColor: COLORS.danger,
                                            bgcolor: 'rgba(235, 91, 60, 0.04)'
                                        }
                                    }}
                                >
                                    Sell
                                </Button>
                            </Box>
                            {error && <Typography color="error" mt={1} variant="body2">{error}</Typography>}
                        </Paper>
                    </Grid>

                    {/* Holdings & History */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ bgcolor: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 2, minHeight: 400 }}>
                            <Tabs
                                value={tabInfo}
                                onChange={(e, v) => setTabInfo(v)}
                                sx={{
                                    borderBottom: `1px solid ${COLORS.border}`,
                                    '& .MuiTab-root': {
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        color: COLORS.textSec
                                    },
                                    '& .Mui-selected': {
                                        color: `${COLORS.primary} !important`
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: COLORS.primary
                                    }
                                }}
                            >
                                <Tab label="Holdings" />
                                <Tab label="Orders" />
                                <Tab label="Pending" />
                                <Tab label="News" />
                            </Tabs>

                            <Box p={2}>
                                {tabInfo === 0 && (
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ color: COLORS.textSec, fontWeight: 600, border: 'none' }}>Stock</TableCell>
                                                    <TableCell align="right" sx={{ color: COLORS.textSec, fontWeight: 600, border: 'none' }}>Qty</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {Object.entries(status?.holdings || {}).map(([ticker, qty]) => (
                                                    <TableRow
                                                        key={ticker}
                                                        onClick={() => setSelectedTicker(ticker)}
                                                        sx={{
                                                            '&:hover': { bgcolor: COLORS.bg },
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                    >
                                                        <TableCell sx={{ color: COLORS.text, fontWeight: 500, border: 'none' }}>
                                                            {ticker.replace('.NS', '')}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ color: COLORS.text, border: 'none' }}>{qty}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {Object.keys(status?.holdings || {}).length === 0 && (
                                                    <TableRow>
                                                        <TableCell colSpan={2} align="center" sx={{ color: COLORS.textSec, border: 'none', py: 4 }}>
                                                            No holdings yet
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}

                                {tabInfo === 1 && (
                                    <Box maxHeight={500} sx={{ overflowY: 'auto' }}>
                                        {trades.map((t) => (
                                            <Box
                                                key={t.id}
                                                mb={1.5}
                                                p={2}
                                                sx={{
                                                    bgcolor: COLORS.bg,
                                                    borderRadius: 1,
                                                    border: `1px solid ${COLORS.border}`
                                                }}
                                            >
                                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight="600"
                                                        sx={{ color: t.action === 'BUY' ? COLORS.success : COLORS.danger }}
                                                    >
                                                        {t.action} {t.ticker.replace('.NS', '')}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: COLORS.textSec }}>
                                                        {t.date.split(' ')[0]}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ color: COLORS.textSec }}>
                                                    {t.quantity} shares @ ₹{t.price.toFixed(2)}
                                                </Typography>
                                            </Box>
                                        ))}
                                        {trades.length === 0 && (
                                            <Typography align="center" sx={{ color: COLORS.textSec, py: 4 }}>
                                                No orders yet
                                            </Typography>
                                        )}
                                    </Box>
                                )}

                                {tabInfo === 2 && (
                                    <Box maxHeight={500} sx={{ overflowY: 'auto' }}>
                                        {pendingOrders.map((o, i) => (
                                            <Box key={i} mb={1.5} p={2} sx={{ bgcolor: COLORS.bg, borderRadius: 1, border: `1px solid ${COLORS.border}` }}>
                                                <Typography variant="body2" fontWeight="600" sx={{ color: o.action === 'BUY' ? COLORS.success : COLORS.danger }}>
                                                    {o.action} {o.ticker} @ ₹{o.price}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: COLORS.textSec }}>
                                                    Qty: {o.quantity}
                                                </Typography>
                                            </Box>
                                        ))}
                                        {pendingOrders.length === 0 && <Typography align="center" sx={{ color: COLORS.textSec, py: 4 }}>No pending orders</Typography>}
                                    </Box>
                                )}

                                {tabInfo === 3 && (
                                    <Box maxHeight={500} sx={{ overflowY: 'auto' }}>
                                        {news.map((item, index) => {
                                            const content = item.content || {};
                                            return (
                                                <Box key={item.id || index} mb={2} p={0} sx={{ borderBottom: `1px solid ${COLORS.border}`, pb: 2 }}>
                                                    <Typography variant="body2" fontWeight="600" sx={{ color: COLORS.text, mb: 0.5 }}>
                                                        <a href={content.clickThroughUrl?.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {content.title}
                                                        </a>
                                                    </Typography>
                                                    <Box display="flex" justifyContent="space-between">
                                                        <Typography variant="caption" sx={{ color: COLORS.textSec }}>
                                                            {content.provider?.displayName}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: COLORS.textSec }}>
                                                            {content.pubDate ? new Date(content.pubDate).toLocaleDateString() : ''}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                        {news.length === 0 && <Typography align="center" sx={{ color: COLORS.textSec, py: 4 }}>No news available</Typography>}
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box >
    )
}

export default App
