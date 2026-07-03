import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { LickEntity, CategoryEntity } from '@ivanrogulj.com/backend/domain/jamini/data-access';
import { JamDetail, JamListItem, JaminiService } from './jamini.service';
import { AssignCategoriesDto, CreateJamDto, SaveLickDto, CategoryDto, UpdateJamDto } from './dto/jamini.dto';
import { UserAuthGuard } from './guards/user-auth.guard';

type AuthedRequest = Request & { user: { userId: string } };

@Controller('jamini')
@UseGuards(UserAuthGuard)
export class JaminiController {
  public constructor(private readonly jaminiService: JaminiService) {}

  @Post('jams')
  @HttpCode(HttpStatus.CREATED)
  public async createJam(@Req() req: AuthedRequest, @Body() dto: CreateJamDto): Promise<JamListItem> {
    return this.jaminiService.createJam(req.user.userId, dto);
  }

  @Get('jams')
  public async listJams(@Req() req: AuthedRequest): Promise<JamListItem[]> {
    return this.jaminiService.listJams(req.user.userId);
  }

  @Get('jams/:id')
  public async getJam(@Param('id') id: string, @Req() req: AuthedRequest): Promise<JamDetail> {
    return this.jaminiService.getJam(id, req.user.userId);
  }

  @Put('jams/:id')
  public async updateJam(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: UpdateJamDto,
  ): Promise<JamListItem> {
    return this.jaminiService.updateJam(id, req.user.userId, dto);
  }

  @Delete('jams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteJam(@Param('id') id: string, @Req() req: AuthedRequest): Promise<void> {
    return this.jaminiService.deleteJam(id, req.user.userId);
  }

  @Put('jams/:id/categories')
  public async setJamCategories(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: AssignCategoriesDto,
  ): Promise<string[]> {
    return this.jaminiService.setJamCategories(id, req.user.userId, dto);
  }

  @Post('jams/:id/licks')
  @HttpCode(HttpStatus.CREATED)
  public async addLick(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: SaveLickDto,
  ): Promise<LickEntity> {
    return this.jaminiService.addLick(id, req.user.userId, dto);
  }

  @Put('licks/:id')
  public async updateLick(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: SaveLickDto,
  ): Promise<LickEntity> {
    return this.jaminiService.updateLick(id, req.user.userId, dto);
  }

  @Delete('licks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteLick(@Param('id') id: string, @Req() req: AuthedRequest): Promise<void> {
    return this.jaminiService.deleteLick(id, req.user.userId);
  }

  @Get('categories')
  public async listCategories(@Req() req: AuthedRequest): Promise<CategoryEntity[]> {
    return this.jaminiService.listCategories(req.user.userId);
  }

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  public async createCategory(@Req() req: AuthedRequest, @Body() dto: CategoryDto): Promise<CategoryEntity> {
    return this.jaminiService.createCategory(req.user.userId, dto);
  }

  @Put('categories/:id')
  public async renameCategory(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: CategoryDto,
  ): Promise<CategoryEntity> {
    return this.jaminiService.renameCategory(id, req.user.userId, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteCategory(@Param('id') id: string, @Req() req: AuthedRequest): Promise<void> {
    return this.jaminiService.deleteCategory(id, req.user.userId);
  }
}
