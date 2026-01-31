import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Box, Container, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Dashboard from './Dashboard';
import Commodities from './Commodities';

const COLORS = {
    bg: '#f5f5f5',
    paper: '#ffffff',
    primary: '#00d09c',
    text: '#44475b',
    border: '#e5e5e5'
};

function App() {
    return (
        <Router>
            <Box sx={{ bgcolor: COLORS.bg, minHeight: '100vh' }}>
                <AppBar position="static" elevation={0} sx={{ bgcolor: COLORS.paper, borderBottom: `1px solid ${COLORS.border}` }}>
                    <Container maxWidth="lg">
                        <Toolbar disableGutters variant="dense">
                            <Typography variant="h6" fontWeight="700" sx={{ color: COLORS.text, mr: 4 }}>
                                StockSim
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <NavLink
                                    to="/"
                                    style={({ isActive }) => ({
                                        textDecoration: 'none',
                                        color: isActive ? COLORS.primary : COLORS.text,
                                        fontWeight: isActive ? 600 : 500,
                                        padding: '6px 16px',
                                        borderRadius: '4px',
                                        backgroundColor: isActive ? '#e8f5f1' : 'transparent',
                                        transition: 'all 0.2s'
                                    })}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    to="/commodities"
                                    style={({ isActive }) => ({
                                        textDecoration: 'none',
                                        color: isActive ? COLORS.primary : COLORS.text,
                                        fontWeight: isActive ? 600 : 500,
                                        padding: '6px 16px',
                                        borderRadius: '4px',
                                        backgroundColor: isActive ? '#e8f5f1' : 'transparent',
                                        transition: 'all 0.2s'
                                    })}
                                >
                                    Commodities
                                </NavLink>
                            </Box>
                        </Toolbar>
                    </Container>
                </AppBar>

                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/commodities" element={<Commodities />} />
                </Routes>
            </Box>
        </Router>
    );
}

export default App;
