import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import Home from './Home';
import UserNotifications from './UserNotifications';
import SendNotifications from './SendNotifications';
import { WebSocketProvider } from './context/WebsocketContext';

const App = () => {
  return (
    <WebSocketProvider>
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WebSocket App
            </Typography>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/send-notifications">Send Notifications</Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/specificUser/:id" element={<UserNotifications />} />
            <Route path="/send-notifications" element={<SendNotifications />} />
          </Routes>
        </Container>
      </Router>
    </WebSocketProvider>
  );
};

export default App;
