import { Injectable, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { ApprovalStatus } from '../user/entities/user.entity';
import { NotificationService } from '../notificacion/notificacion.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async register(email: string, name: string, password: string) {
    const existingUser = await this.userService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Ya existe un usuario con ese email');
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date();
    verificationCodeExpiry.setHours(verificationCodeExpiry.getHours() + 24);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      email,
      name,
      password: hashedPassword,
    } as never);

    return {
      success: true,
      message: 'Registro exitoso. Revisa tu email para verificar tu cuenta',
      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (user.approvalStatus === ApprovalStatus.PENDING) {
      throw new UnauthorizedException('Tu cuenta está pendiente de aprobación por un administrador');
    }

    if (user.approvalStatus === ApprovalStatus.REJECTED) {
      throw new UnauthorizedException('Tu solicitud de registro fue rechazada');
    }

    if (!user.active) {
      throw new UnauthorizedException('Tu cuenta está desactivada');
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
    user.verificationCode = '';
    user.verificationCodeExpiry = new Date();

    await this.userService.updateVerification(user);

    await this.notificationService.notifyAdminsNewUserPending(user.id, user.name, user.email);

    return { 
      success: true, 
      message: 'Email verificado. Tu cuenta está pendiente de aprobación por un administrador' 
    };
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

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      return { 
        success: true, 
        message: 'Si el email existe, recibirás un código de recuperación' 
      };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const resetCodeExpiry = new Date();
    resetCodeExpiry.setHours(resetCodeExpiry.getHours() + 1);

    user.passwordResetCode = resetCode;
    user.passwordResetExpiry = resetCodeExpiry;

    await this.userService.updatePasswordReset(user);

    await this.emailService.sendPasswordResetCode(user.email, user.name, resetCode);

    return { 
      success: true, 
      message: 'Código de recuperación enviado. Revisa tu email' 
    };
  }

  async resetPassword(
    email: string, 
    code: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (!user.passwordResetCode) {
      throw new BadRequestException('No hay solicitud de recuperación activa');
    }

    if (user.passwordResetCode !== code) {
      throw new BadRequestException('Código incorrecto');
    }

    if (new Date() > user.passwordResetExpiry) {
      throw new BadRequestException('Código expirado. Solicita uno nuevo');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetCode = '';
    user.passwordResetExpiry = new Date();

    await this.userService.updatePasswordReset(user);

    return { 
      success: true, 
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión' 
    };
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