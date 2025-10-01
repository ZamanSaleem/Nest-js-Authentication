import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    const port = parseInt(this.config.get<string>('MAIL_PORT') || '587', 10);

    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port,
      secure: port === 465, // 👈 auto set secure for 465
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
      tls: {
        rejectUnauthorized: false, // 👈 helps debug TLS issues (disable later in prod)
      },
    });
  }

  async sendEmail({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM') || 'noreply@example.com',
        to,
        subject,
        text,
        html,
      });
      this.logger.log(`✅ Email sent: ${info.messageId}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`❌ Email send failed: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }
}
