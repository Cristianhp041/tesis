import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Debes verificar tu email antes de iniciar sesión');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async verifyEmail(email: string, code: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.emailVerified) {
      return { success: true, message: 'Email ya verificado' };
    }

    if (user.verificationCode !== code) {
      throw new BadRequestException('Código incorrecto');
    }

    if (new Date() > user.verificationCodeExpiry) {
      throw new BadRequestException('Código expirado. Solicita uno nuevo');
    }

    user.emailVerified = true;
    user.active = true;
    user.verificationCode = '';
    user.verificationCodeExpiry = new Date();

    await this.userService.updateVerification(user);

    await this.emailService.sendWelcomeEmail(user.email, user.name);

    return { success: true, message: 'Email verificado. Ya puedes iniciar sesión' };
  }

  async resendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email ya verificado');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date();
    verificationCodeExpiry.setHours(verificationCodeExpiry.getHours() + 24);

    user.verificationCode = verificationCode;
    user.verificationCodeExpiry = verificationCodeExpiry;

    await this.userService.updateVerification(user);
    await this.emailService.sendVerificationCode(user.email, user.name, verificationCode);

    return { success: true, message: 'Código enviado exitosamente' };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) return null;

    if (!user.active) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return user;
  }
}