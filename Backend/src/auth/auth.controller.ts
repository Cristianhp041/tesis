import { Body, Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/Register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ApproveUserDto, RejectUserDto } from './dto/Approval.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from '../user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.name, dto.password);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Post('resend-code')
  resendCode(@Body() dto: ResendCodeDto) {
    return this.authService.resendVerificationCode(dto.email);
  }

  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Get('pending-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingUsers() {
    return this.userService.findPendingApproval();
  }

  @Post('approve-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approveUser(@Body() dto: ApproveUserDto) {
    return this.userService.approveUser(dto.userId);
  }

  @Post('reject-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectUser(@Body() dto: RejectUserDto) {
    return this.userService.rejectUser(dto.userId, dto.reason);
  }
}