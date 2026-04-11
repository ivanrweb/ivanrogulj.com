import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { MediumService } from './medium.service';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { BackendDomainArticleDataAccessModule } from '@ivanrogulj.com/backend/domain/article/data-access';
import { BackendDomainUserDataAccessModule } from '@ivanrogulj.com/backend/domain/user/data-access';
import { BackendCoreMailModule } from '@ivanrogulj.com/backend/core/mail';

@Module({
  imports: [BackendDomainArticleDataAccessModule, BackendDomainUserDataAccessModule, BackendCoreMailModule],
  controllers: [ArticleController, NewsletterController],
  providers: [MediumService, NewsletterService],
})
export class BackendDomainArticleApiModule {}
