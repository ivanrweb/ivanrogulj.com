import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from './entity/article.entity';
import { ArticleRepository } from './repo/article.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity])],
  providers: [ArticleRepository],
  exports: [ArticleRepository],
})
export class BackendDomainArticleDataAccessModule {}
