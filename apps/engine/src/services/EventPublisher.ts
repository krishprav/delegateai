import { createRedisClient } from "@delegate/redis";

export class EventPublisher {
    private client;

    constructor() {
        this.client = createRedisClient();
        this.client.connect();
    }

    async publish( channel: string, event: any ){
        await this.client.publish(channel, JSON.stringify(event) )
    }
}

