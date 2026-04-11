import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserRepository } from '@ivanrogulj.com/backend/domain/user/data-access';

@Controller('newsletter')
export class NewsletterController {
  public constructor(private readonly userRepository: UserRepository) {}

  @Get('unsubscribe')
  public async unsubscribe(@Query('token') token: string, @Res() res: Response): Promise<void> {
    if (!token) {
      res.status(400).send(this.html('Invalid link.', 'The unsubscribe link is missing a token.'));
      return;
    }

    const success = await this.userRepository.unsubscribeByToken(token);

    if (success) {
      res.send(this.html('Unsubscribed.', 'You have been successfully unsubscribed from article notifications.'));
    } else {
      res.status(404).send(this.html('Not found.', 'This unsubscribe link is invalid or already used.'));
    }
  }

  private html(title: string, message: string): string {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>${title}</title>
  <style>
    body { font-family: 'Fira Code', monospace; background: #0b0c10; color: #c5c6c7; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .box { text-align: center; padding: 2rem; border: 1px solid #333; border-radius: 8px; background: #1f2833; max-width: 400px; }
    h2 { color: #66fcf1; margin: 0 0 1rem; }
    p { color: #888; font-size: 0.85rem; margin: 0; }
  </style>
</head>
<body>
  <div class="box">
    <h2>${title}</h2>
    <p>${message}</p>
  </div>
</body>
</html>`;
  }
}
