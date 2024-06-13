"use client";
import React, { useContext } from 'react';
import { WebSocketContext } from '../WebSocketContext';
import { Button } from '@mui/material';

const SendNotificationButton: React.FC = () => {
    const context = useContext(WebSocketContext);
    if (!context) return null;

    const { sendNotification } = context;

    const handleSend = () => {
        const message = prompt('Enter notification message:');
        if (message) {
            sendNotification({ message });
        }
    };

    return (
        <Button variant="contained" color="primary" onClick={handleSend}>
            Send Notification
        </Button>
    );
};

export default SendNotificationButton;
