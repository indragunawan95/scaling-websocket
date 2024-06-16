import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { WebSocketModule } from './websocket/websocket.module';
// import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
// import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // EventsModule,
    RedisModule,
    WebSocketModule,
    // PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule { }
