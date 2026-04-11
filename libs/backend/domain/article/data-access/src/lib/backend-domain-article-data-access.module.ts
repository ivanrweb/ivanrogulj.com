import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { ArticleRepository } from './repo/article.repository';
import { NotifiedArticleEntity } from './entity/notified-article.entity';
import { NotifiedArticleRepository } from './repo/notified-article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, NotifiedArticleEntity])],
  providers: [ArticleRepository, NotifiedArticleRepository],
  exports: [ArticleRepository, NotifiedArticleRepository],
})
export class BackendDomainArticleDataAccessModule {}
