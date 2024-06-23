// WebSocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:8080';
const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socketConnection = io(SOCKET_SERVER_URL, {
      transports: ['websocket']
    });
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};
