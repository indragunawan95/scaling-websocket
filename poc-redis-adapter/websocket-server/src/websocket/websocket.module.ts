import { Module } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    imports: [PrismaModule],
    providers: [AppWebSocketGateway, WebSocketService],
})
export class WebSocketModule { }
