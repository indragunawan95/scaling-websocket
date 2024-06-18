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
import { PrismaService } from "src/prisma/prisma.service";

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AppWebSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(AppWebSocketGateway.name);

    constructor(private readonly prisma: PrismaService) {}

    afterInit(server: any) {
        this.logger.log('AppWebSocketGateway initialized');
    }

    async handleConnection(client: Socket) {
        console.log(`${client.id} connected`)
        const userId = client.handshake.query.userId as string;

        if (userId) {
            client.join(userId);

            const missedNotifications = await this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            client.emit('notification', missedNotifications);
            console.log("notification ter kirim")
        }
    }

    handleDisconnect(client: Socket) {
        // handle disconnect logic if needed
        console.log(`${client.id} disconnected`)
    }

    @SubscribeMessage('sendNotification')
    async handleNotification(client: Socket, payload: any) {
        console.log(`client : ${client.id} payload: ${payload}`)
        const { message, userId, group, broadcast } = payload;
        await this.prisma.notification.create({
            data: {
                message,
                userId,
                group,
                broadcast,
            },
        });

        const missedNotifications = await this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        // not handle group and broadcast
        if (broadcast) {
            this.server.emit('notification', missedNotifications);
        } else if (userId) {
            this.server.to(userId).emit('notification', missedNotifications);
        } else if (group) {
            this.server.to(group).emit('notification', missedNotifications);
        }
    }

    @SubscribeMessage('joinGroup')
    handleJoinGroup(client: Socket, group: string) {
        client.join(group);
    }

    @SubscribeMessage('leaveGroup')
    handleLeaveGroup(client: Socket, group: string) {
        client.leave(group);
    }
}
