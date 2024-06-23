import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useWebSocket } from './context//WebsocketContext';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const UserNotifications = () => {
  const { id } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const socket = useWebSocket();

  useEffect(() => {
    if (socket) {
      socket.emit('getUserGroups', { userId: id });

      socket.on('getUserGroups', (groups) => {
        setGroups(groups);
      });

      socket.on('notifications', (notifications) => {
        setNotifications(notifications);
        // console.log("notifications", notifications)
        // setNotifications(prev => ([...prev, notifications]));
      });

      // socket.emit('notifications', { userId: id, tytypeNotification: 'initial' });

      socket.on('error', (message) => {
        setError(message);
      });

      return () => {
        socket.off('getUserGroups');
        socket.off('notifications');
        socket.off('error');
      };
    }
  }, [socket, id]);

  console.log("groups", groups)

  return (
    <Box sx={{ p: 3 }}>
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          <Typography variant="h4" gutterBottom>
            Notifications for User: {id}
          </Typography>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Groups
            </Typography>
            <List>
              {groups.map((el) => (
                <ListItem key={el.group.id} divider>
                  <ListItemText primary={el.group.name} />
                </ListItem>
              ))}
            </List>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              Notifications
            </Typography>
            <List>
              {notifications.map((notification, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={notification.content}
                  />
                  {/* <ListItemText
                    primary={notification.content}
                    secondary={notification.type}
                  /> */}
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default UserNotifications;
