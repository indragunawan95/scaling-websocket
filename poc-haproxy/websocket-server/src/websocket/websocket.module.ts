import { Module } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket.gateway';
import { RedisModule } from "../redis/redis.module";

@Module({
    imports: [RedisModule],
    providers: [AppWebSocketGateway],
})
export class WebSocketModule { }
