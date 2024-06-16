import { Module } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { RedisModule } from "../redis/redis.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [RedisModule, PrismaModule],
    providers: [AppWebSocketGateway, WebSocketService],
})
export class WebSocketModule { }
