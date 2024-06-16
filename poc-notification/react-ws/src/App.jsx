import React, { useEffect } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:8082';

const App = () => {
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 10, // Number of attempts before giving up
      reconnectionDelay: 1000, // Initial delay between reconnection attempts
      reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
      randomizationFactor: 0.5, // Randomization factor for reconnection delay
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

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>WebSocket Client</h1>
    </div>
  );
};

export default App;
