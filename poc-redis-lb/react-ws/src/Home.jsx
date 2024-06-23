import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, TextField, Box } from '@mui/material';

const Home = () => {
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    const handleConnect = () => {
        if (userId) {
            navigate(`/specificUser/${userId}`);
        }
    };
    const handleSendNotification = () => {
        navigate(`/send-notifications`);
    };

    return (
        <div>
            <Container>
                <Box mt={4} textAlign="center">
                    <Typography variant="h4" gutterBottom>Connect to WebSocket</Typography>
                    <TextField
                        variant="outlined"
                        label="Enter User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        margin="normal"
                    />
                    <Box mt={2}>
                        <Button variant="contained" color="primary" onClick={handleConnect}>Connect</Button>
                    </Box>
                </Box>
            </Container>
        </div>
    );
};

export default Home;
