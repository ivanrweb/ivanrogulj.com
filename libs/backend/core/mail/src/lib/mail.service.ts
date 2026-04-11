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

  public async sendNewsletterNotification(
    to: string,
    article: { title: string; excerpt: string; mediumUrl: string },
    unsubscribeToken: string
  ): Promise<void> {
    const backendUrl =
      this.configService.get<string>('BACKEND_URL') ?? 'http://localhost:3000';
    const unsubscribeUrl = `${backendUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
    await this.transporter.sendMail({
      from: `"ivanrogulj.com" <articles@ivanrogulj.com>`,
      replyTo: 'ivan.rogulj92@gmail.com',
      to,
      subject: `New article: ${article.title}`,
      html: `
        <div style="font-family:'Fira Code',monospace;background:#0b0c10;padding:2rem;color:#c5c6c7;max-width:600px;margin:0 auto;">
          <p style="color:#888;font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;margin:0 0 1rem;">new article</p>
          <h2 style="color:#66fcf1;margin:0 0 1rem;font-size:1.2rem;line-height:1.4;">${article.title}</h2>
          <p style="color:#c5c6c7;font-size:0.85rem;line-height:1.6;margin:0 0 1.5rem;">${article.excerpt}</p>
          <a href="${article.mediumUrl}" style="display:inline-block;background:rgba(102,252,241,0.1);border:1px solid #66fcf1;color:#66fcf1;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:0.8rem;font-weight:700;letter-spacing:1px;">
            Read article →
          </a>
          <hr style="border:none;border-top:1px solid #333;margin:2rem 0;" />
          <p style="color:#555;font-size:0.7rem;">
            You're receiving this because you subscribed to article notifications on ivanrogulj.com.<br/>
            <a href="${unsubscribeUrl}" style="color:#555;text-decoration:underline;">Unsubscribe</a>
          </p>
        </div>
      `,
    });
  }

  public async sendEmailConfirmation(to: string, token: string): Promise<void> {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:4200';
    const confirmUrl = `${frontendUrl}/email-confirmed?token=${token}`;
    await this.transporter.sendMail({
      from: `"ivanrogulj.com" <articles@ivanrogulj.com>`,
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
