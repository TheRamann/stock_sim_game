
import { CssBaseline, AppBar, Toolbar, Typography, Box, ThemeProvider, createTheme } from '@mui/material';
import Dashboard from './components/Dashboard';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Quant Trading App
            </Typography>
          </Toolbar>
        </AppBar>
        <Dashboard />
      </Box>
    </ThemeProvider>
  );
}

export default App;
