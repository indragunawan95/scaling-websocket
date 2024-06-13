"use client";
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';

interface Notification {
    message: string;
}

interface WebSocketContextProps {
    notifications: Notification[];
    sendNotification: (data: Notification) => void;
}

export const WebSocketContext = createContext<WebSocketContextProps | null>(null);

interface WebSocketProviderProps {
    children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const newSocket = io('http://localhost:4000');
        setSocket(newSocket);

        newSocket.on('receiveNotification', (data: Notification) => {
            setNotifications((prevNotifications) => [...prevNotifications, data]);
        });

        // Return a cleanup function to close the socket when the component unmounts
        return () => {
            newSocket.close();
        };
    }, []);

    const sendNotification = (data: Notification) => {
        if (socket) {
            socket.emit('sendNotification', data);
        }
    };

    return (
        <WebSocketContext.Provider value={{ notifications, sendNotification }}>
            {children}
        </WebSocketContext.Provider>
    );
};
