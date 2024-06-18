import { Injectable } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket/websocket.gateway';

@Injectable()
export class AppService {
  constructor(private readonly appWebSocketGateway: AppWebSocketGateway) { }

  getHello(): string {
    return 'Hello World!';
  }

  // sendMessageToUser(userId: string, message: string) {
  //   this.appWebSocketGateway.publishToUser(userId, message)
  // }
  // sendMessageToGroup(groupId: string, message: string) {
  //   this.appWebSocketGateway.publishToGroup(groupId, message)
  // }
  // sendMessageToBroadcast(message: string) {
  //   this.appWebSocketGateway.publishToBroadcast(message)
  // }
}
