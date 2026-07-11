import { ConfigService } from '@nestjs/config';

export function getRequiredJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}
