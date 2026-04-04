import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticleCategory } from '@ivanrogulj.com/shared/data-access/model';
import { JwtAuthGuard } from '@ivanrogulj.com/backend/core/auth';
import { ArticleEntity } from '@ivanrogulj.com/backend/domain/article/data-access';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticleController {
  public constructor(private readonly articleService: ArticleService) {}

  @Get()
  public async findAll(@Query('category') category?: ArticleCategory): Promise<ArticleEntity[]> {
    return this.articleService.findAll(category);
  }

  @Get(':slug')
  public async findBySlug(@Param('slug') slug: string): Promise<ArticleEntity> {
    return this.articleService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  public async create(@Body() dto: CreateArticleDto): Promise<ArticleEntity> {
    return this.articleService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    return this.articleService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  public async delete(@Param('id') id: string): Promise<void> {
    return this.articleService.delete(id);
  }
}
