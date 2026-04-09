import { Module } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { MediumService } from './medium.service';

@Module({
  controllers: [ArticleController],
  providers: [MediumService],
})
export class BackendDomainArticleApiModule {}
