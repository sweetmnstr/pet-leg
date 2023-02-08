import { Logger } from '@nestjs/common';
import { RedisModule } from './redis.module';

export const redisModule = RedisModule.registerAsync({
  useFactory: async () => {
    const logger = new Logger('RedisModule');

    return {
      connectionOptions: {
        socket: {
          host: process.env.REDIS_HOST,
          port: +process.env.REDIS_PORT,
        },
      },
      onClientReady: () => {
        logger.log('Redis client ready');

        logger.log(
          `Connected to redis on ${process.env.REDIS_HOST}:${+process.env
            .REDIS_PORT}`,
        );
      },
    };
  },
});
