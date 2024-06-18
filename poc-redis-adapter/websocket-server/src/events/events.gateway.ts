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
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
        // this.webSocketService.setServer(server);
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        // this.webSocketService.handleConnection(client);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        // this.webSocketService.handleDisconnect(client);
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