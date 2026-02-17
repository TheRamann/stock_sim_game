import React, { useEffect, useState } from 'react';
import { Container, Grid, Paper, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress } from '@mui/material';
import { getPortfolio, type PortfolioSummary } from '../api';

const Dashboard: React.FC = () => {
    const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPortfolio();
                setPortfolio(data);
            } catch (error) {
                console.error("Failed to fetch portfolio", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
    }

    if (!portfolio) {
        return <Typography color="error" align="center" mt={4}>Failed to load portfolio data</Typography>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {/* Summary Cards */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Total Value
                        </Typography>
                        <Typography component="p" variant="h4">
                            ${portfolio.total_value.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Cash
                        </Typography>
                        <Typography component="p" variant="h4">
                            ${portfolio.cash.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Equity
                        </Typography>
                        <Typography component="p" variant="h4">
                            ${portfolio.equity.toFixed(2)}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Positions Table */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <Typography component="h2" variant="h6" color="primary" gutterBottom>
                            Current Positions
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Ticker</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Avg Price</TableCell>
                                    <TableCell align="right">Current Price</TableCell>
                                    <TableCell align="right">PnL</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {portfolio.positions.map((row) => (
                                    <TableRow key={row.ticker}>
                                        <TableCell>{row.ticker}</TableCell>
                                        <TableCell align="right">{row.quantity}</TableCell>
                                        <TableCell align="right">${row.average_price.toFixed(2)}</TableCell>
                                        <TableCell align="right">${row.current_price.toFixed(2)}</TableCell>
                                        <TableCell align="right" sx={{ color: row.pnl >= 0 ? 'green' : 'red' }}>
                                            ${row.pnl.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {portfolio.positions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">No positions</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};



export default Dashboard;
