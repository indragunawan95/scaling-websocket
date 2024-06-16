// app-websocket.gateway.ts

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
import { PrismaService } from "src/prisma/prisma.service";

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
    private clients: Map<string, Map<string, ClientInfo>> = new Map();
    private subscribedUsers: Set<string> = new Set();

    constructor(private readonly redisService: RedisService, private readonly prismaService: PrismaService) {
        this.redisService.setMessageHandler(this.handleRedisMessage.bind(this));
    }

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
    }

    async handleConnection(client: Socket) {
        const userId = Array.isArray(client.handshake.query.userId) ? client.handshake.query.userId[0] : client.handshake.query.userId;
        const clientId = client.id;

        if (!userId) {
            client.disconnect(true);
            return;
        }

        const userInDB = await this.prismaService.user.findFirst({ where: { id: Number(userId) } });
        if (!userInDB) {
            client.emit('error', 'Invalid User ID');
            client.disconnect(true);
            return;
        }

        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Map());
        }

        const userClients = this.clients.get(userId);
        userClients.set(clientId, { id: clientId, lastConnected: new Date() });

        if (!this.subscribedUsers.has(userId)) {
            console.log(`Subscribing user: ${userId}`);
            await this.redisService.subscribe(`user:${userId}`);
            this.subscribedUsers.add(userId);
        }

        this.logger.log(`Client connected: ${clientId} for user: ${userId}`);
        client.emit('connected', 'Welcome!');
        // fetch current notif
        this.fetchUserNotification(userId)
    }

    async handleDisconnect(client: Socket) {
        const userId = Array.isArray(client.handshake.query.userId) ? client.handshake.query.userId[0] : client.handshake.query.userId;
        const clientId = client.id;

        if (!userId) {
            return;
        }

        if (this.clients.has(userId)) {
            const userClients = this.clients.get(userId);
            userClients.delete(clientId);
            if (userClients.size === 0) {
                this.clients.delete(userId);
                this.subscribedUsers.delete(userId);
                await this.redisService.unsubscribe(`user:${userId}`);
            }
        }
        this.logger.log(`Client disconnected: ${clientId} for user: ${userId}`);
    }

    @SubscribeMessage('message')
    handleMessage(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
        console.log(`Message received from client ${client.id}: ${payload}`);
    }

    sendMessageToClient(userId: string, clientId: string, message: string) {
        const userClients = this.clients.get(userId);
        if (userClients && userClients.has(clientId)) {
            const clientInfo = userClients.get(clientId);
            this.server.to(clientInfo.id).emit('notification', message);
            this.logger.log(`Message sent to client ${clientInfo.id} for user ${userId}: ${message}`);
        } else {
            this.logger.warn(`Client with id ${clientId} not found for user ${userId}`);
        }
    }

    async sendMessageToUser(userId: string, message: string) {
        const userClients = this.clients.get(userId);
        const notification = await this.prismaService.userNotification.findMany({
            where: {
                id: Number(userId)
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        const notificationMsg = notification.map((x) => x.content)
        if (userClients) {
            userClients.forEach(clientInfo => {
                this.server.to(clientInfo.id).emit('notification', notificationMsg);
                this.logger.log(`Message sent to client ${clientInfo.id} for user ${userId}: ${message}`);
            });
        } else {
            this.logger.warn(`No clients found for user ${userId}`);
        }
    }

    async fetchUserNotification(userId: string) {
        const userClients = this.clients.get(userId);
        const notification = await this.prismaService.userNotification.findMany({
            where: {
                userId: Number(userId)
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        const notificationMsg = notification.map((x) => x.content)
        if (userClients) {
            userClients.forEach(clientInfo => {
                this.server.to(clientInfo.id).emit('notification', notificationMsg);
                this.logger.log(`Message sent to client ${clientInfo.id} for user ${userId}`);
            });
        } else {
            this.logger.warn(`No clients found for user ${userId}`);
        }
    }

    async publishToUser(userId: string, message: string) {
        await this.prismaService.userNotification.create({
            data: {
                userId: Number(userId),
                content: message
            }
        })
        await this.redisService.publish(`user:${userId}`, message)
    }

    private async handleRedisMessage(channel: string, message: string) {
        const userId = channel.split(':')[1];
        // console.log(`Handling Redis message for user: ${userId} - ${message}`);
        // this.sendMessageToUser(userId, message);
        await this.fetchUserNotification(userId)
    }
}
