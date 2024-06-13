import { Module } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket.gateway';
import { WebSocketService } from './websocket.service';

@Module({
    providers: [AppWebSocketGateway, WebSocketService],
})
export class WebSocketModule { }
