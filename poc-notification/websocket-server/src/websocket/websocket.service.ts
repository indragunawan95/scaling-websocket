import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class WebSocketService {
    private server: Server;


    setServer(server: Server) {
        this.server = server;
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    handleMessage(client: Socket, payload: any) {
        console.log(`Received message from ${client.id}:`, payload);
        this.server.emit('message', payload);
    }
}
