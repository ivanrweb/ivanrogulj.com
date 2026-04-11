import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  UserRepository,
  UserAuthSettingsRepository,
  AuditLogRepository,
  AuditEventType,
  AuthProvider,
} from '@ivanrogulj.com/backend/domain/user/data-access';
import { MailService } from '@ivanrogulj.com/backend/core/mail';

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 100;

@Injectable()
export class UserAuthService {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly settingsRepository: UserAuthSettingsRepository,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  public async register(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    await this.auditLogRepository.log(AuditEventType.REGISTRATION_ATTEMPT, { email });

    const settings = await this.settingsRepository.getSettings();
    if (!settings.registrationEnabled) {
      throw new ForbiddenException('Registration is currently disabled.');
    }

    const recentAttempts = await this.auditLogRepository.countRecentRegistrationAttempts(RATE_LIMIT_WINDOW_MS);
    if (recentAttempts >= RATE_LIMIT_MAX) {
      settings.registrationEnabled = false;
      await this.settingsRepository.save(settings);
      await this.auditLogRepository.log(AuditEventType.REGISTRATION_DISABLED, {
        meta: { reason: 'rate_limit', attempts: recentAttempts },
      });
      throw new ForbiddenException('Registration is currently disabled due to high traffic.');
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const confirmToken = uuidv4();
    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      passwordHash,
      provider: AuthProvider.LOCAL,
      emailConfirmed: false,
      emailConfirmToken: confirmToken,
      subscribedToNewsletter: true,
      newsletterUnsubscribeToken: uuidv4(),
    });
    const saved = await this.userRepository.save(user);

    try {
      await this.mailService.sendEmailConfirmation(email, confirmToken);
    } catch (err) {
      console.error('[MailService] Failed to send confirmation email:', err);
      console.log(`[DEV] Confirm token for ${email}: ${confirmToken}`);
    }
    await this.auditLogRepository.log(AuditEventType.REGISTRATION_SUCCESS, { userId: saved.id, email });
  }

  public async confirmEmail(token: string): Promise<void> {
    const user = await this.userRepository.findByConfirmToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired confirmation token.');
    }
    user.emailConfirmed = true;
    user.emailConfirmToken = null;
    await this.userRepository.save(user);
    await this.auditLogRepository.log(AuditEventType.EMAIL_CONFIRMED, { userId: user.id, email: user.email });
  }

  public async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.passwordHash) {
      await this.auditLogRepository.log(AuditEventType.LOGIN_FAILURE, { email });
      throw new UnauthorizedException('Invalid credentials.');
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      await this.auditLogRepository.log(AuditEventType.LOGIN_FAILURE, { userId: user.id, email });
      throw new UnauthorizedException('Invalid credentials.');
    }
    if (!user.emailConfirmed) {
      throw new ForbiddenException('Please confirm your email before logging in.');
    }
    const payload = { sub: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    await this.auditLogRepository.log(AuditEventType.LOGIN_SUCCESS, { userId: user.id, email });
    return { access_token: this.jwtService.sign(payload) };
  }

  public async handleGoogleCallback(
    googleId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    let user = await this.userRepository.findByGoogleId(googleId);

    if (!user) {
      user = await this.userRepository.findByEmail(email);
      if (user) {
        user.googleId = googleId;
        user.emailConfirmed = true;
        await this.userRepository.save(user);
      } else {
        user = this.userRepository.create({
          email,
          googleId,
          provider: AuthProvider.GOOGLE,
          emailConfirmed: true,
          passwordHash: null,
          emailConfirmToken: null,
          subscribedToNewsletter: true,
          newsletterUnsubscribeToken: uuidv4(),
        });
        await this.userRepository.save(user);
      }
    }

    await this.auditLogRepository.log(AuditEventType.GOOGLE_AUTH_SUCCESS, { userId: user.id, email });
    const payload = { sub: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
    return { access_token: this.jwtService.sign(payload) };
  }
}
