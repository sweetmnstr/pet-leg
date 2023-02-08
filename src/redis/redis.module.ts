import { DynamicModule } from '@nestjs/common';
import { Module } from '@nestjs/common';
import * as cacheManager from 'cache-manager';

import { RedisClientOptions, StoreConfig } from 'redis';
import { redisStore } from 'cache-manager-redis-store';

export const IORedisKey = 'IORedis';

type RedisModuleOptions = {
  connectionOptions: RedisClientOptions & StoreConfig;
  onClientReady?: (client) => void;
};

type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
};

@Module({})
export class RedisModule {
  static async registerAsync({
    useFactory,
  }: RedisAsyncModuleOptions): Promise<DynamicModule> {
    const redisProvider = {
      provide: IORedisKey,
      useFactory: async (...args) => {
        const { connectionOptions, onClientReady } = await useFactory(...args);
        const redisCache = cacheManager.caching({
          store: await redisStore(connectionOptions),
        });

        onClientReady(redisCache);

        return redisCache;
      },
    };

    return {
      module: RedisModule,
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
