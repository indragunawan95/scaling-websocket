import { WebSocketGateway as NestWebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';

@NestWebSocketGateway()
export class AppWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    constructor(private readonly webSocketService: WebSocketService) { }

    afterInit(server: Server) {
        this.webSocketService.setServer(server);
    }

    handleConnection(client: Socket) {
        this.webSocketService.handleConnection(client);
    }

    handleDisconnect(client: Socket) {
        this.webSocketService.handleDisconnect(client);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() payload: any, client: Socket) {
        this.webSocketService.handleMessage(client, payload);
    }
}
