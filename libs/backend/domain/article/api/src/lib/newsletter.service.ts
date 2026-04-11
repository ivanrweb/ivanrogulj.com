import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MediumService } from './medium.service';
import { NotifiedArticleRepository } from '@ivanrogulj.com/backend/domain/article/data-access';
import { UserRepository } from '@ivanrogulj.com/backend/domain/user/data-access';
import { MailService } from '@ivanrogulj.com/backend/core/mail';

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  public constructor(
    private readonly mediumService: MediumService,
    private readonly notifiedArticleRepository: NotifiedArticleRepository,
    private readonly userRepository: UserRepository,
    private readonly mailService: MailService,
  ) {}

  @Cron('0 */6 * * *')
  public async checkAndSendNewArticles(): Promise<void> {
    this.logger.log('Checking for new Medium articles...');
    try {
      const [articles, notifiedIds] = await Promise.all([
        this.mediumService.getAll(),
        this.notifiedArticleRepository.findAllIds(),
      ]);

      const notifiedSet = new Set(notifiedIds);
      const newArticles = articles.filter((a) => !notifiedSet.has(a.id));

      if (newArticles.length === 0) {
        this.logger.log('No new articles found.');
        return;
      }

      const subscribers = await this.userRepository.findNewsletterSubscribers();
      this.logger.log(`Sending ${newArticles.length} new article(s) to ${subscribers.length} subscriber(s).`);

      for (const article of newArticles) {
        for (const user of subscribers) {
          if (!user.newsletterUnsubscribeToken) continue;
          try {
            await this.mailService.sendNewsletterNotification(
              user.email,
              { title: article.title, excerpt: article.excerpt, mediumUrl: article.mediumUrl },
              user.newsletterUnsubscribeToken,
            );
          } catch (err) {
            this.logger.error(`Failed to send newsletter to ${user.email}:`, err);
          }
        }
        await this.notifiedArticleRepository.markAsNotified(article.id);
        this.logger.log(`Notified article: ${article.title}`);
      }
    } catch (err) {
      this.logger.error('Newsletter check failed:', err);
    }
  }
}
