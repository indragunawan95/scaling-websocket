"use client";
import React, { useContext, useState } from 'react';
import { WebSocketContext } from '../WebSocketContext';
import { IconButton, Badge, Menu, List, ListItem, ListItemText } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

const NotificationBell: React.FC = () => {
    const context = useContext(WebSocketContext);
    if (!context) return null;

    const { notifications } = context;
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleOpen}>
                <Badge badgeContent={notifications.length} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                <List>
                    {notifications.map((notification, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={notification.message} />
                        </ListItem>
                    ))}
                </List>
            </Menu>
        </>
    );
};

export default NotificationBell;
