import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PhraseEntity, SetlistEntity } from '@ivanrogulj.com/backend/domain/practice-jam/data-access';
import { JamDetail, JamListItem, PracticeJamService } from './practice-jam.service';
import { AssignSetlistsDto, CreateJamDto, SavePhraseDto, SetlistDto, UpdateJamDto } from './dto/practice-jam.dto';
import { UserAuthGuard } from './guards/user-auth.guard';

type AuthedRequest = Request & { user: { userId: string } };

@Controller('practice-jam')
@UseGuards(UserAuthGuard)
export class PracticeJamController {
  public constructor(private readonly practiceJamService: PracticeJamService) {}

  @Post('jams')
  @HttpCode(HttpStatus.CREATED)
  public async createJam(@Req() req: AuthedRequest, @Body() dto: CreateJamDto): Promise<JamListItem> {
    return this.practiceJamService.createJam(req.user.userId, dto);
  }

  @Get('jams')
  public async listJams(@Req() req: AuthedRequest): Promise<JamListItem[]> {
    return this.practiceJamService.listJams(req.user.userId);
  }

  @Get('jams/:id')
  public async getJam(@Param('id') id: string, @Req() req: AuthedRequest): Promise<JamDetail> {
    return this.practiceJamService.getJam(id, req.user.userId);
  }

  @Put('jams/:id')
  public async updateJam(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: UpdateJamDto,
  ): Promise<JamListItem> {
    return this.practiceJamService.updateJam(id, req.user.userId, dto);
  }

  @Delete('jams/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteJam(@Param('id') id: string, @Req() req: AuthedRequest): Promise<void> {
    return this.practiceJamService.deleteJam(id, req.user.userId);
  }

  @Put('jams/:id/setlists')
  public async setJamSetlists(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: AssignSetlistsDto,
  ): Promise<string[]> {
    return this.practiceJamService.setJamSetlists(id, req.user.userId, dto);
  }

  @Post('jams/:id/phrases')
  @HttpCode(HttpStatus.CREATED)
  public async addPhrase(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: SavePhraseDto,
  ): Promise<PhraseEntity> {
    return this.practiceJamService.addPhrase(id, req.user.userId, dto);
  }

  @Put('phrases/:id')
  public async updatePhrase(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: SavePhraseDto,
  ): Promise<PhraseEntity> {
    return this.practiceJamService.updatePhrase(id, req.user.userId, dto);
  }

  @Delete('phrases/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deletePhrase(@Param('id') id: string, @Req() req: AuthedRequest): Promise<void> {
    return this.practiceJamService.deletePhrase(id, req.user.userId);
  }

  @Get('setlists')
  public async listSetlists(@Req() req: AuthedRequest): Promise<SetlistEntity[]> {
    return this.practiceJamService.listSetlists(req.user.userId);
  }

  @Post('setlists')
  @HttpCode(HttpStatus.CREATED)
  public async createSetlist(@Req() req: AuthedRequest, @Body() dto: SetlistDto): Promise<SetlistEntity> {
    return this.practiceJamService.createSetlist(req.user.userId, dto);
  }

  @Put('setlists/:id')
  public async renameSetlist(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: SetlistDto,
  ): Promise<SetlistEntity> {
    return this.practiceJamService.renameSetlist(id, req.user.userId, dto);
  }

  @Delete('setlists/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteSetlist(@Param('id') id: string, @Req() req: AuthedRequest): Promise<void> {
    return this.practiceJamService.deleteSetlist(id, req.user.userId);
  }
}
