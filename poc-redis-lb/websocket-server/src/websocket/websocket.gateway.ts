import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    ConnectedSocket
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WebSocketService } from "./websocket.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(AppWebSocketGateway.name);

    constructor(private readonly websocketService: WebSocketService) { }

    afterInit(server: any) {
        this.websocketService.setServer(server);
        this.logger.log('AppWebSocketGateway initialized');
    }

    async handleConnection(client: Socket) {
        this.websocketService.handleConnection(client);
    }

    handleDisconnect(client: Socket) {
        this.websocketService.handleDisconnect(client);
    }

    @SubscribeMessage('getUserGroups')
    async getUserGroups(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
        this.websocketService.getUserGroups(client, payload);
    }

    @SubscribeMessage('getNotificationForUser')
    async getNotificationForUser(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
        this.websocketService.getUserGroups(client, payload);
    }

    @SubscribeMessage('notifications')
    async handleNotification(@ConnectedSocket() client: Socket, @MessageBody() payload: any) {
        console.log("here", payload)
        const { typeNotification } = payload;
        switch (typeNotification) {
            case 'user':
                this.websocketService.sendNotificationForUser(payload)
                break;
            case 'group':
                this.websocketService.sendNotificationForGroup(payload)
                break;
            case 'broadcast':
                this.websocketService.sendNotificationForBroadcast(payload)
                break;
            
            default:
                break;
        }
    }
}
