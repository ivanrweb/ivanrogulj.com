import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  public constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: this.configService.get<string>('RESEND_API_KEY'),
      },
    });
  }

  public async sendEmailConfirmation(to: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
    const confirmUrl = `${frontendUrl}/email-confirmed?token=${token}`;
    await this.transporter.sendMail({
      from: `"ivanrogulj.com" <noreply@ivanrogulj.com>`,
      to,
      subject: 'Confirm your email — ivanrogulj.com',
      html: `
        <div style="font-family:'Fira Code',monospace;background:#0b0c10;padding:2rem;color:#c5c6c7;">
          <h2 style="color:#66fcf1;">// confirm your email</h2>
          <p>Click the link below to activate your account:</p>
          <p><a href="${confirmUrl}" style="color:#66fcf1;">${confirmUrl}</a></p>
          <p style="color:#888;font-size:0.8rem;">If you didn't register, ignore this email.</p>
        </div>
      `,
    });
  }
}
