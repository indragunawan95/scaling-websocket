import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import './App.css'; // Import CSS for styling

const SOCKET_SERVER_URL = 'http://localhost:8080';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/specificUser/:id" element={<UserNotifications />} />
      </Routes>
    </Router>
  );
};

const Home = () => {
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleConnect = () => {
    if (userId) {
      navigate(`/specificUser/${userId}`);
    }
  };

  return (
    <div className="App">
      <h1>WebSocket Client</h1>
      <div className="form">
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID"
        />
        <button onClick={handleConnect}>Connect</button>
      </div>
    </div>
  );
};

const UserNotifications = () => {
  const { id } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [groups, setGroups] = useState([]);
  const socketRef = React.useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      // withCredentials: true,
      // transports: ['websocket'],
      query: { userId: id },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
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

    socket.on('connected', (message) => {
      console.log(message);
    });

    socket.emit('getGroups', { userId: id });

    socket.on('getGroups', (groups) => {
      setGroups(groups);
    });

    socket.on('notification', (notifications) => {
      setNotifications(notifications);
    });

    socket.on('error', (message) => {
      setError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

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
              <div key={group.id} className="group">
                <span>{group.name}</span>
              </div>
            ))}
          </div>
          <div className="message-list">
            <h2>Notifications</h2>
            {notifications.map((notification, index) => (
              <>
                <div key={index} className="message">
                  {notification.content}
                  <div key={index} className="notification-type">
                    {notification.type}
                  </div>
                </div>
              </>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
