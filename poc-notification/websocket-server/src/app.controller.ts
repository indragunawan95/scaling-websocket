import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('send-message-client')
  sendMessageToClient(
    @Query('userId') userId: string,
    @Query('clientId') clientId: string,
    @Query('message') message: string,
  ) {
    console.log("here")
    this.appService.sendMessageToClient(userId, clientId, message);
    return `Message sent to client ${clientId}`;
  }

  @Get('send-message-user')
  sendMessageUser(
    @Query('userId') userId: string,
    @Query('message') message: string,
  ) {
    console.log("here")
    this.appService.sendMessageToUser(userId, message);
    return `Message sent to user ${userId}`;
  }
}
