import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  async register(body: any) {
    const { userName, email, password } = body;
    if (!userName || !email || !password) {
      throw new BadRequestException('All fields are required');
    }

    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const otp = generateOtp();
    const expiryMs = parseInt(this.config.get<string>('OTP_EXPIRES_IN_MINUTES') || '10', 10) * 60 * 1000;
    const user = await this.users.createUser({ userName, email, password, isVerified: false });
    (user as any).setVerificationOtp(otp, expiryMs);
    await this.users.save(user as any);

    const emailResult = await this.email.sendEmail({
      to: email,
      subject: 'Verify your account',
      text: `Your OTP is ${otp}. It expires in ${this.config.get<string>('OTP_EXPIRES_IN_MINUTES') || '10'} minutes.`,
    });
    if (!emailResult.success) {
      throw new BadRequestException('Failed to send verification email');
    }
    return { success: true, message: 'Registration successful. Verify email with OTP.' };
  }

  async verifyOtp(body: any) {
    const { email, otp } = body;
    if (!email || !otp) throw new BadRequestException('Email and OTP required');
    const user = await this.users.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if ((user as any).isVerified) throw new BadRequestException('User already verified');
    if ((user as any).verificationOTP !== otp || Date.now() > new Date((user as any).verificationOTPExpiry || 0).getTime()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    (user as any).isVerified = true;
    (user as any).clearVerificationOtp();
    await this.users.save(user as any);
    return { success: true, message: 'Email verified successfully' };
  }

  async resendOtp(body: any) {
    const { email } = body;
    if (!email) throw new BadRequestException('Email required');
    const user = await this.users.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if ((user as any).isVerified) throw new BadRequestException('User already verified');
    const otp = generateOtp();
    const expiryMs = parseInt(this.config.get<string>('OTP_EXPIRES_IN_MINUTES') || '10', 10) * 60 * 1000;
    (user as any).setVerificationOtp(otp, expiryMs);
    await this.users.save(user as any);
    const emailResult = await this.email.sendEmail({ to: email, subject: 'Resend OTP', text: `Your new OTP is ${otp}` });
    if (!emailResult.success) throw new BadRequestException('Failed to resend OTP email');
    return { success: true, message: 'OTP resent successfully' };
  }

  async login(body: any) {
    const { email, password } = body;
    if (!email || !password) throw new BadRequestException('Email and password required');
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) throw new NotFoundException('User not found');
    if (!(user as any).isVerified) throw new UnauthorizedException('Please verify your email first');
    const isMatch = await (user as any).isPasswordMatch(password);
    if (!isMatch) throw new UnauthorizedException('Incorrect password');
    const token = await this.jwt.signAsync({ id: (user as any)._id, email: (user as any).email, role: (user as any).role });
    return { success: true, data: { token }, message: 'Logged in successfully' };
  }

  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(body: any) {
    const { email } = body;
    if (!email) throw new BadRequestException('Email required');
    const user = await this.users.findByEmail(email);
    if (!user) {
      return { success: true, message: 'If the email exists, a password reset OTP has been sent' };
    }
    if (!(user as any).isVerified) throw new BadRequestException('Please verify your email first before resetting password');
    if ((user as any).resetOTP && (user as any).resetOTPExpiry && Date.now() < new Date((user as any).resetOTPExpiry).getTime()) {
      const remainingTime = Math.ceil((new Date((user as any).resetOTPExpiry).getTime() - Date.now()) / 60000);
      throw new BadRequestException(`Please wait ${remainingTime} minutes before requesting another password reset`);
    }
    const otp = generateOtp();
    const expiryMs = parseInt(this.config.get<string>('OTP_EXPIRES_IN_MINUTES') || '10', 10) * 60 * 1000;
    (user as any).setResetOtp(otp, expiryMs);
    await this.users.save(user as any);
    const emailResult = await this.email.sendEmail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your password reset OTP is ${otp}. It expires in ${this.config.get<string>('OTP_EXPIRES_IN_MINUTES') || '10'} minutes.`,
    });
    if (!emailResult.success) throw new BadRequestException('Failed to send password reset email');
    return { success: true, message: 'If the email exists, a password reset OTP has been sent' };
  }

  async resetPassword(body: any) {
    const { email, otp, newPassword } = body;
    if (!email || !otp || !newPassword) throw new BadRequestException('All fields required');
    const user = await this.users.findByEmailWithPassword(email);
    if (!user) throw new NotFoundException('User not found');
    if (!(user as any).isVerified) throw new BadRequestException('Please verify your email first');
    if (!(user as any).resetOTP || !(user as any).resetOTPExpiry) throw new BadRequestException('No password reset request found');
    if ((user as any).resetOTP !== otp) throw new UnauthorizedException('Invalid OTP');
    if (Date.now() > new Date((user as any).resetOTPExpiry).getTime()) throw new UnauthorizedException('OTP has expired');
    (user as any).password = newPassword;
    (user as any).clearResetOtp();
    await this.users.save(user as any);
    return { success: true, message: 'Password reset successfully' };
  }
}


