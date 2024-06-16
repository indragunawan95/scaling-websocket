import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    ConnectedSocket
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

interface ClientInfo {
    id: string;
    lastConnected: Date;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('AppGateway');
    private clients: Map<string, ClientInfo> = new Map();

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
        // this.webSocketService.setServer(server);
    }

    handleConnection(client: Socket) {
        const clientInfo: ClientInfo = {
            id: client.id,
            lastConnected: new Date(),
        };
        this.clients.set(client.id, clientInfo);
        this.logger.log(`Client connected: ${client.id}`);
        client.emit('connected', 'Welcome!');
    }

    handleDisconnect(client: Socket) {
        this.clients.delete(client.id);
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('events')
    findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
        return from([1, 2, 3]).pipe(map(item => ({ event: 'events', data: item })));
    }

    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
        return data;
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
        console.log(`Message received from client ${client.id}: ${payload}`);
        // this.webSocketService.handleMessage(client, payload);
        // return payload;
    }
}