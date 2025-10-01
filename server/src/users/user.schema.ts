import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  role?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: String, default: null })
  verificationOTP?: string | null;

  @Prop({ type: Date, default: null })
  verificationOTPExpiry?: Date | null;

  @Prop({ type: String, default: null })
  resetOTP?: string | null;

  @Prop({ type: Date, default: null })
  resetOTPExpiry?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.isPasswordMatch = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.setVerificationOtp = function (otp: string, expiryMs: number) {
  this.verificationOTP = otp;
  this.verificationOTPExpiry = new Date(Date.now() + expiryMs);
};

UserSchema.methods.setResetOtp = function (otp: string, expiryMs: number) {
  this.resetOTP = otp;
  this.resetOTPExpiry = new Date(Date.now() + expiryMs);
};

UserSchema.methods.clearVerificationOtp = function () {
  this.verificationOTP = null;
  this.verificationOTPExpiry = null;
};

UserSchema.methods.clearResetOtp = function () {
  this.resetOTP = null;
  this.resetOTPExpiry = null;
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (err) {
    next(err as Error);
  }
});


