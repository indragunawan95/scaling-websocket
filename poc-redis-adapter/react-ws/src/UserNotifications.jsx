import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useParams } from 'react-router-dom';
import './App.css';

const SOCKET_SERVER_URL = 'http://localhost:3001';

const UserNotifications = () => {
  const { id } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [recipientUserId, setRecipientUserId] = useState('');
  const [group, setGroup] = useState('');
  const [broadcast, setBroadcast] = useState(false);
  const socketRef = useRef(null);
  const lastNotificationIdRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      query: {
        userId: id,
        lastNotificationId: lastNotificationIdRef.current || 0,
      },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('reconnect_attempt', (attempt) => {
      console.log(`Reconnection attempt ${attempt}`);
    });

    socket.on('reconnect', () => {
      console.log('Reconnected to server');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    socket.on('notification', (notification) => {
        setNotifications(notification)
        // setNotifications((prevNotifications) => [...prevNotifications, notification]);
    //   lastNotificationIdRef.current = notification.id;
    });

    socket.on('error', (message) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const joinGroup = (group) => {
    socketRef.current.emit('joinGroup', group);
  };

  const leaveGroup = (group) => {
    socketRef.current.emit('leaveGroup', group);
  };

  const handleSendNotification = () => {
    const notificationPayload = {
      message,
      userId: recipientUserId,
      group,
      broadcast,
    };
    console.log("here")
    socketRef.current.emit('sendNotification', notificationPayload);
    setMessage('');
    setRecipientUserId('');
    setGroup('');
    setBroadcast(false);
  };

  return (
    <div className="App">
      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <h1>Notifications for User: {id}</h1>
          <div className="group-list">
            <h2>Groups</h2>
            {groups.map((group) => (
              <div key={group} className="group">
                <span>{group}</span>
                <button onClick={() => joinGroup(group)}>Join</button>
                <button onClick={() => leaveGroup(group)}>Leave</button>
              </div>
            ))}
          </div>
          <div className="message-list">
            <h2>Notifications</h2>
            {notifications.map((notification) => (
              <div key={notification.id} className="message">
                {notification.message}
              </div>
            ))}
          </div>
          <div className="notification-form">
            <h2>Send Notification</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSendNotification(); }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message"
                required
              />
              <input
                type="text"
                value={recipientUserId}
                onChange={(e) => setRecipientUserId(e.target.value)}
                placeholder="Recipient User ID"
              />
              <input
                type="text"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="Group"
              />
              <label>
                Broadcast:
                <input
                  type="checkbox"
                  checked={broadcast}
                  onChange={(e) => setBroadcast(e.target.checked)}
                />
              </label>
              <button type="submit">Send Notification</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default UserNotifications;
