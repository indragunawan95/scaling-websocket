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
import { RedisService } from '../redis/redis.service';

interface ClientInfo {
    id: string;
    lastConnected: Date;
}

@WebSocketGateway({
    cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    },
})
export class AppWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger: Logger = new Logger('AppGateway');

    constructor(private readonly redisService: RedisService) {}

    async afterInit(server: Server) {
        console.log('WebSocket server initialized');
    }

    async handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    async handleDisconnect(client: Socket) {

        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
