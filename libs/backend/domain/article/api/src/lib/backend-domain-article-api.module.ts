import { Module } from '@nestjs/common';
import { BackendDomainArticleDataAccessModule } from '@ivanrogulj.com/backend/domain/article/data-access';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [BackendDomainArticleDataAccessModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class BackendDomainArticleApiModule {}
