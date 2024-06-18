import { Module } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket.gateway';

@Module({
    imports: [],
    providers: [AppWebSocketGateway],
})
export class WebSocketModule { }
