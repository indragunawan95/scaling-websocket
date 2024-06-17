import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('send-message-user')
  sendMessageUser(
    @Query('userId') userId: string,
    @Query('message') message: string,
  ) {
    this.appService.sendMessageToUser(userId, message);
    return `Message sent to user ${userId}`;
  }
  @Get('send-message-group')
  sendMessageGroup(
    @Query('groupId') groupId: string,
    @Query('message') message: string,
  ) {
    console.log("here")
    this.appService.sendMessageToGroup(groupId, message);
    return `Message sent to group ${groupId}`;
  }
}
