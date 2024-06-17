import { Injectable } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket/websocket.gateway';
import { RedisService } from "./redis/redis.service";

@Injectable()
export class AppService {
  constructor(private readonly appWebSocketGateway: AppWebSocketGateway, private readonly redisService: RedisService) { }

  getHello(): string {
    return 'Hello World!';
  }

  // sendMessageToClient(userId: string, clientId: string, message: string) {
  //   this.appWebSocketGateway.sendMessageToClient(userId, clientId, message);
  // }
  sendMessageToUser(userId: string, message: string) {
    this.appWebSocketGateway.publishToUser(userId, message)
  }
  sendMessageToGroup(groupId: string, message: string) {
    this.appWebSocketGateway.publishToGroup(groupId, message)
  }
}
