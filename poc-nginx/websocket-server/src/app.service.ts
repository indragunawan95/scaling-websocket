import { Injectable } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket/websocket.gateway';
import { RedisService } from "./redis/redis.service";

@Injectable()
export class AppService {
  constructor(private readonly appWebSocketGateway: AppWebSocketGateway, private readonly redisService: RedisService) { }

  getHello(): string {
    return 'Hello World!';
  }
}
