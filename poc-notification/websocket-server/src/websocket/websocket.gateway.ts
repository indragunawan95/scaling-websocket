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
    private groupUser: Map<string, Set<string>> = new Map();
    private subscribedUsers: Set<string> = new Set();

    constructor(private readonly redisService: RedisService, private readonly prismaService: PrismaService) {
        this.redisService.setMessageHandler(this.handleRedisMessage.bind(this));
    }

    async afterInit(server: Server) {
        console.log('WebSocket server initialized');
        await this.redisService.subscribe('broadcast');
        this.subscribedUsers.add('broadcast');
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

        // Query user groups and subscribe to group channels
        const userGroups = await this.prismaService.userGroup.findMany({ where: { userId: Number(userId) } });
        userGroups.forEach(group => {
            const groupId = String(group.groupId);
            if (!this.groupUser.has(groupId)) {
                this.groupUser.set(groupId, new Set());
            }
            this.groupUser.get(groupId).add(userId);
            this.redisService.subscribe(`group:${groupId}`);
        });

        this.logger.log(`Client connected: ${clientId} for user: ${userId}`);
        client.emit('connected', 'Welcome!');
        // fetch current notifications
        this.fetchUserNotification(userId);
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

        // Unsubscribe from group channels if no other clients are connected
        const userGroups = await this.prismaService.userGroup.findMany({ where: { userId: Number(userId) } });
        userGroups.forEach(group => {
            const groupId = String(group.groupId);
            if (this.groupUser.has(groupId)) {
                const groupUsers = this.groupUser.get(groupId);
                groupUsers.delete(userId);
                if (groupUsers.size === 0) {
                    this.groupUser.delete(groupId);
                    this.redisService.unsubscribe(`group:${groupId}`);
                }
            }
        });

        this.logger.log(`Client disconnected: ${clientId} for user: ${userId}`);
    }

    @SubscribeMessage('getGroups')
    async handleGetGroup(@MessageBody() payload: any, @ConnectedSocket() client: Socket) {
        const { userId } = payload;
        const userGroups = await this.prismaService.userGroup.findMany({
            where: {
                userId: Number(userId)
            },
            include: {
                group: true
            }
        });
        const groups = userGroups.map(x => x.group);
        this.sendMessageToClient(userId, client.id, 'getGroups', groups);
    }

    sendMessageToClient(userId: string, clientId: string, channel: string, message: any) {
        const userClients = this.clients.get(userId);
        if (userClients && userClients.has(clientId)) {
            const clientInfo = userClients.get(clientId);
            this.server.to(clientInfo.id).emit(channel, message);
            this.logger.log(`Message sent to client ${clientInfo.id} for user ${userId}`);
        } else {
            this.logger.warn(`Client with id ${clientId} not found for user ${userId}`);
        }
    }

    async sendMessageToUser(userId: string, message: string) {
        const userClients = this.clients.get(userId);
        const notifications = await this.fetchUserNotification(userId);
        if (userClients) {
            userClients.forEach(clientInfo => {
                this.server.to(clientInfo.id).emit('notification', notifications);
                this.logger.log(`Message sent to client ${clientInfo.id} for user ${userId}: ${message}`);
            });
        } else {
            this.logger.warn(`No clients found for user ${userId}`);
        }
    }

    async fetchUserNotification(userId: string) {
        const userClients = this.clients.get(userId);

        // Fetch notifications from the userNotification table
        const userNotifications = await this.prismaService.userNotification.findMany({
            where: {
                userId: Number(userId)
            },
            select: {
                content: true,
                createdAt: true
            }
        });

        // Fetch group IDs for the user
        const userGroups = await this.prismaService.userGroup.findMany({
            where: {
                userId: Number(userId)
            },
            select: {
                groupId: true
            }
        });

        const groupIds = userGroups.map(group => group.groupId);

        // Fetch notifications from the groupNotification table for the user's groups
        const groupNotifications = await this.prismaService.groupNotification.findMany({
            where: {
                groupId: {
                    in: groupIds
                }
            },
            select: {
                content: true,
                createdAt: true
            }
        });

        // Fetch broadcast notifications
        const broadcastNotifications = await this.prismaService.broadcastNotification.findMany({
            select: {
                content: true,
                createdAt: true
            }
        });

        // Combine and sort notifications by createdAt
        const notifications = [
            ...userNotifications.map(notification => ({ ...notification, type: 'user' })),
            ...groupNotifications.map(notification => ({ ...notification, type: 'group' })),
            ...broadcastNotifications.map(notification => ({ ...notification, type: 'broadcast' }))
        ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        if (userClients) {
            userClients.forEach(clientInfo => {
                this.server.to(clientInfo.id).emit('notification', notifications);
                this.logger.log(`Notifications sent to client ${clientInfo.id} for user ${userId}`);
            });
        } else {
            this.logger.warn(`No clients found for user ${userId}`);
        }

        return notifications;
    }

    async publishToUser(userId: string, message: string) {
        await this.prismaService.userNotification.create({
            data: {
                userId: Number(userId),
                content: message
            }
        });
        await this.redisService.publish(`user:${userId}`, message);
    }

    async publishToGroup(groupId: string, message: string) {
        // Insert message into the database
        await this.prismaService.groupNotification.create({
            data: {
                groupId: Number(groupId),
                content: message
            }
        });
        // Publish to the Redis PubSub channel for the group
        await this.redisService.publish(`group:${groupId}`, message);
    }

    async publishToBroadcast(message: string) {
        // Insert message into the database
        await this.prismaService.broadcastNotification.create({
            data: {
                content: message
            }
        });
        // Publish to the Redis PubSub channel for broadcast
        await this.redisService.publish(`broadcast`, message);
    }

    private async handleRedisMessage(channel: string, message: string) {
        if (channel.startsWith('user:')) {
            const userId = channel.split(':')[1];
            await this.fetchUserNotification(userId);
        } else if (channel.startsWith('group:')) {
            const groupId = channel.split(':')[1];
            // Fetch all users in the group and send the message
            if (this.groupUser.has(groupId)) {
                const groupUsers = this.groupUser.get(groupId);
                for (const userId of groupUsers) {
                    await this.fetchUserNotification(userId);
                }
            }
        } else if (channel === 'broadcast') {
            // Fetch all users and send the broadcast message
            for (const userId of this.clients.keys()) {
                await this.fetchUserNotification(userId);
            }
        }
    }
}
