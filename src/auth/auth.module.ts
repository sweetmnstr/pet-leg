import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt/jwt.strategy';
import { AuthController } from './auth.controller';
import { CustomerModule } from '../customer/customer.module';
import { LawyerModule } from '../lawyer/lawyer.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshSession } from './refresh-session.entity';
import { JWTSessionService } from './jwt-session.service';
import { UserSessionService } from './user-session.service';
import { redisModule } from '../redis/redis.config';
import { FacebookStrategy } from './facebook/facebook.strategy';
import { GoogleStrategy } from './google/google.strategy';
import { NotificationFiltersModule } from '../notification-filters/notification-filters.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TypeOrmModule.forFeature([RefreshSession]),
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_LIFETIME },
    }),
    CustomerModule,
    LawyerModule,
    redisModule,
    NotificationFiltersModule,
    ChatModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    AuthService,
    JWTSessionService,
    UserSessionService,
    FacebookStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService, JWTSessionService],
})
export class AuthModule {}
