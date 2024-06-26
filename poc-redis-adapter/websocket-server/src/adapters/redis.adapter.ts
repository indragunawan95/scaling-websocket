import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;
    private configService: ConfigService;

    constructor(app: INestApplicationContext) {
        super(app);
        this.configService = app.get(ConfigService);
    }

    async connectToRedis(): Promise<void> {
        const redisUrl = this.configService.get<string>('REDIS_URL');
        console.log("Connecting to Redis at", redisUrl);

        const pubClient = createClient({ url: redisUrl });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
