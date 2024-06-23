import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationType } from "@prisma/client";

@Injectable()
export class WebSocketService {
    private server: Server;

    constructor(private readonly prismaService: PrismaService) { }

    setServer(server: Server) {
        this.server = server;
    }

    async handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    async getUserGroups(client: Socket, payload: any) {
        const userId = Number(payload.userId);

        // // Refetch notifications for User
        const refetchNotification = await this.getAllNotificationsForUser(Number(userId));
        client.emit('notifications', refetchNotification);

        const groups = await this.prismaService.userGroup.findMany({
            where: {
                user_id: userId,
            },
            include: {
                group: true,
            },
        });

        if (payload.userId) {
            client.join(payload.userId);
            console.log(`Client ${client.id} joined room: ${userId}`);

            groups.forEach(element => {
                const groupId = String(element.group_id);
                client.join(groupId);
                console.log(`Client ${client.id} joined group room: ${groupId}`);
            });
        }

        client.join('broadcast');
        console.log(`Client ${client.id} joined broadcast room`);

        client.emit('getUserGroups', groups);
    }

    async sendNotificationForUser(payload: any) {
        const { userId, message } = payload;
        console.log(`Emitting notification to user ${userId}: ${message}`);
        try {
            await this.prismaService.$transaction(async (prisma) => {
                const res = await prisma.notification.create({
                    data: {
                        notification_type: NotificationType.USER,
                        content: message
                    }
                });
                await prisma.userNotification.create({
                    data: {
                        notification_id: res.notification_id,
                        user_id: Number(userId)
                    }
                });
            });
        } catch (error) {
            console.error(`Error sending notification to user ${userId}: ${error.message}`);
        }
        // Refetch notifications for User
        const refetchNotification = await this.getAllNotificationsForUser(Number(userId));
        this.server.to(userId).emit('notifications', refetchNotification);
    }

    async sendNotificationForGroup(payload: any) {
        const { groupId, message } = payload;
        console.log(`Emitting notification to group ${groupId}: ${message}`);
        try {
            await this.prismaService.$transaction(async (prisma) => {
                const res = await prisma.notification.create({
                    data: {
                        notification_type: NotificationType.GROUP,
                        content: message
                    }
                });
                await prisma.groupNotification.create({
                    data: {
                        notification_id: res.notification_id,
                        group_id: Number(groupId)
                    }
                });

            });
        } catch (error) {
            console.error(`Error sending notification to group ${groupId}: ${error.message}`);
        }

        // Refetch notifications for all users in the group
        const userIds = await this.prismaService.userGroup.findMany({
            where: { group_id: Number(groupId) },
            select: { user_id: true },
        });

        for (const user of userIds) {
            const refetchNotification = await this.getAllNotificationsForUser(user.user_id);
            this.server.to(String(user.user_id)).emit('notifications', refetchNotification);
        }

        // this.server.to(groupId).emit('notifications', message);
    }

    async sendNotificationForBroadcast(payload: any) {
        const { message } = payload;
        console.log(`Emitting broadcast notification: ${message}`);
        try {
            await this.prismaService.$transaction(async (prisma) => {
                const res = await prisma.notification.create({
                    data: {
                        notification_type: NotificationType.BROADCAST,
                        content: message
                    }
                });
                await prisma.broadcastNotification.create({
                    data: {
                        notification_id: res.notification_id,
                    }
                });

                
            });
        } catch (error) {
            console.error(`Error sending broadcast notification: ${error.message}`);
        }

        // Refetch notifications for all users
        const users = await this.prismaService.user.findMany({ select: { id: true } });

        for (const user of users) {
            const refetchNotification = await this.getAllNotificationsForUser(user.id);
            this.server.to(String(user.id)).emit('notifications', refetchNotification);
        }

        // this.server.to('broadcast').emit('notifications', message);
    }

    async getAllNotificationsForUser(userId: number) {
        const result = await this.prismaService.$queryRaw`
            (
            SELECT n.notification_id, n.content, n.created_at
            FROM "Notification" n
            JOIN "UserNotification" un ON n.notification_id = un.notification_id
            WHERE un.user_id = ${userId}
            )
            UNION
            (
            SELECT n.notification_id, n.content, n.created_at
            FROM "Notification" n
            JOIN "GroupNotification" gn ON n.notification_id = gn.notification_id
            JOIN "UserGroup" ug ON gn.group_id = ug.group_id
            WHERE ug.user_id = ${userId}
            )
            UNION
            (
            SELECT n.notification_id, n.content, n.created_at
            FROM "Notification" n
            JOIN "BroadcastNotification" bn ON n.notification_id = bn.notification_id
            )
            ORDER BY created_at;
        `;
        return result;
    }
}
