import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SongChordsService, SongChordsListItem, SongChordsDetail } from './song-chords.service';
import { SaveSongChordsDto } from './dto/save-song-chords.dto';
import { SongChordsAuthGuard } from './guards/song-chords-auth.guard';

@Controller('song-chords')
@UseGuards(SongChordsAuthGuard)
export class SongChordsController {
  public constructor(private readonly service: SongChordsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async save(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: SaveSongChordsDto,
  ): Promise<SongChordsListItem> {
    return this.service.save(req.user.userId, dto);
  }

  @Get('my')
  public async findByUser(
    @Req() req: Request & { user: { userId: string } },
  ): Promise<SongChordsListItem[]> {
    return this.service.findByUser(req.user.userId);
  }

  @Get(':id')
  public async findOne(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ): Promise<SongChordsDetail> {
    return this.service.findOne(id, req.user.userId);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: SaveSongChordsDto,
  ): Promise<SongChordsListItem> {
    return this.service.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ): Promise<void> {
    return this.service.delete(id, req.user.userId);
  }
}
