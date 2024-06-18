// redis.service.ts

import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private subscriber: Redis;
    private messageHandler: (channel: string, message: string) => void;

    constructor(@Inject('REDIS') private readonly redis: Redis) {
        this.subscriber = this.redis.duplicate();
        this.subscriber.on('message', (channel, message) => {
            if (this.messageHandler) {
                console.log(`Redis message received: ${channel} - ${message}`);
                this.messageHandler(channel, message);
            }
        });
    }

    async subscribe(channel: string) {
        console.log(`Subscribing to channel: ${channel}`);
        await this.subscriber.subscribe(channel);
    }

    async unsubscribe(channel: string) {
        console.log(`Unsubscribing from channel: ${channel}`);
        await this.subscriber.unsubscribe(channel);
    }

    async publish(channel: string, message: string) {
        console.log(`Publishing message to channel: ${channel} - ${message}`);
        await this.redis.publish(channel, message);
    }

    setMessageHandler(handler: (channel: string, message: string) => void) {
        this.messageHandler = handler;
    }
}
