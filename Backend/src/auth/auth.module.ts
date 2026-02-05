import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notificacion/notificacion.module';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => EmailModule),
    forwardRef(() => NotificationModule),
    JwtModule.register({
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule], 
})
export class AuthModule {}