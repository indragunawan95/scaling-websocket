import React, { useState } from 'react';
import { useWebSocket } from './context/WebsocketContext';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';

const SendNotifications = () => {
    const [message, setMessage] = useState('');
    const [recipientUserId, setRecipientUserId] = useState('');
    const [groupId, setGroupId] = useState('');
    const [notificationType, setNotificationType] = useState('user');
    const socket = useWebSocket();

    const handleSendNotification = () => {
        const notificationPayload = {
            message,
            userId: notificationType === 'user' ? recipientUserId : null,
            groupId: notificationType === 'group' ? groupId : null,
            broadcast: notificationType === 'broadcast',
            typeNotification: notificationType
        };
        socket.emit('notifications', notificationPayload);
        setMessage('');
        setRecipientUserId('');
        setGroupId('');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Send Notification</Typography>
            <form onSubmit={(e) => { e.preventDefault(); handleSendNotification(); }}>
                <FormControl variant="outlined" fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Notification Type</InputLabel>
                    <Select
                        value={notificationType}
                        onChange={(e) => setNotificationType(e.target.value)}
                        label="Notification Type"
                    >
                        <MenuItem value="user">User</MenuItem>
                        <MenuItem value="group">Group</MenuItem>
                        <MenuItem value="broadcast">Broadcast</MenuItem>
                    </Select>
                </FormControl>
                {notificationType === 'user' && (
                    <TextField
                        label="Recipient User ID"
                        variant="outlined"
                        fullWidth
                        value={recipientUserId}
                        onChange={(e) => setRecipientUserId(e.target.value)}
                        placeholder="Recipient User ID"
                        sx={{ mb: 2 }}
                    />
                )}
                {notificationType === 'group' && (
                    <TextField
                        label="Group ID"
                        variant="outlined"
                        fullWidth
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        placeholder="Group ID"
                        sx={{ mb: 2 }}
                    />
                )}
                <TextField
                    label="Message"
                    variant="outlined"
                    fullWidth
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message"
                    required
                    sx={{ mb: 2 }}
                />
                
                <Button type="submit" variant="contained" color="primary">
                    Send Notification
                </Button>
            </form>
        </Box>
    );
};

export default SendNotifications;
