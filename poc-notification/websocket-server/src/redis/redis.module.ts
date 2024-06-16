import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

@Global()
@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'REDIS',
            useFactory: (configService: ConfigService) => {
                return new Redis(configService.get<string>('REDIS_URL'));
            },
            inject: [ConfigService],
        },
        RedisService,
    ],
    exports: ['REDIS', RedisService],
})
export class RedisModule { }
