import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box, Container, Grid, Paper, Typography, Button,
    Select, MenuItem, FormControl, InputLabel, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Tab, Tabs, CircularProgress, Chip
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
        }
    }, [selectedTicker, status?.current_date, selectedPeriod]);

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
            const res = await axios.post(endpoint, {
                ticker: selectedTicker,
                quantity: parseInt(quantity),
                action: action
            });
            setStatus(res.data.status);
            setError('');
            fetchTrades();
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
                            {/* Stock Selector */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <FormControl variant="standard" sx={{ minWidth: 150 }}>
                                    <Select
                                        value={selectedTicker}
                                        onChange={(e) => setSelectedTicker(e.target.value)}
                                        disableUnderline
                                        sx={{
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            color: COLORS.text,
                                            '& .MuiSvgIcon-root': { color: COLORS.text }
                                        }}
                                    >
                                        {tickers.map(t => <MenuItem key={t} value={t}>{t.replace('.NS', '')}</MenuItem>)}
                                    </Select>
                                </FormControl>
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
                                    <LineChart data={history}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                                        <XAxis dataKey="date" hide />
                                        <YAxis
                                            domain={['auto', 'auto']}
                                            stroke={COLORS.textSec}
                                            tick={{ fill: COLORS.textSec, fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: COLORS.paper,
                                                border: `1px solid ${COLORS.border}`,
                                                borderRadius: 8,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                            itemStyle={{ color: COLORS.primary, fontWeight: 600 }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            stroke={COLORS.primary}
                                            dot={false}
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </Box>

                            {/* Trading Controls */}
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
                                                    <TableRow key={ticker} sx={{ '&:hover': { bgcolor: COLORS.bg } }}>
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
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default App
