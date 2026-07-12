import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ArticleController } from './article.controller';
import { MediumService } from './medium.service';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { BackendDomainArticleDataAccessModule } from '@ivanrogulj.com/backend/domain/article/data-access';
import { BackendDomainUserDataAccessModule } from '@ivanrogulj.com/backend/domain/user/data-access';
import { BackendCoreMailModule } from '@ivanrogulj.com/backend/core/mail';

@Module({
  imports: [
    BackendDomainArticleDataAccessModule,
    BackendDomainUserDataAccessModule,
    BackendCoreMailModule,
    ThrottlerModule.forRoot([{ name: 'newsletter', ttl: 60000, limit: 5 }]),
  ],
  controllers: [ArticleController, NewsletterController],
  providers: [MediumService, NewsletterService],
})
export class BackendDomainArticleApiModule {}
