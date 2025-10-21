import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
      cache: true,
  }), CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.getOrThrow<string>('REDIS_HOST'),
        port: configService.getOrThrow<number>('REDIS_PORT'),
        db: 0,
        ttl: 60 * 60,
      }),
    }),],
  controllers: [],
  providers: [],
})
export class AppModule {}

// https://walwaldev.tistory.com/153 Redis 캐싱 참고 블로그 주소.
