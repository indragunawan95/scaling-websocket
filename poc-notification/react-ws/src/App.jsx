import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { BrowserRouter as Router, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import './App.css'; // Import CSS for styling

const SOCKET_SERVER_URL = 'http://localhost:8082';

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
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      query: { userId: id },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
    });

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

    socket.on('notification', (message) => {
      console.log("msg", message)
      console.log("messages", messages)
      setMessages(message);
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
          <div className="message-list">
            {messages.map((message, index) => (
              <div key={index} className="message">
                {message}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
