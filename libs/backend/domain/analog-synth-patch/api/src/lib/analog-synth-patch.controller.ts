import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AnalogSynthPatchService, FullPatch, PatchListItem } from './analog-synth-patch.service';
import { SavePatchDto } from './dto/save-patch.dto';
import { UserAuthGuard } from './guards/user-auth.guard';

@Controller('patches')
export class AnalogSynthPatchController {
  public constructor(private readonly patchService: AnalogSynthPatchService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(UserAuthGuard)
  public async save(
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: SavePatchDto,
  ): Promise<PatchListItem> {
    return this.patchService.save(req.user.userId, dto);
  }

  @Get('my')
  @UseGuards(UserAuthGuard)
  public async findByUser(
    @Req() req: Request & { user: { userId: string } },
  ): Promise<PatchListItem[]> {
    return this.patchService.findByUser(req.user.userId);
  }

  @Get('public')
  public async findPublic(): Promise<PatchListItem[]> {
    return this.patchService.findPublic();
  }

  @Get(':id')
  @UseGuards(UserAuthGuard)
  public async findFullPatch(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ): Promise<FullPatch> {
    return this.patchService.findFullPatch(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(UserAuthGuard)
  public async delete(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
  ): Promise<void> {
    return this.patchService.delete(id, req.user.userId);
  }

  @Put(':id')
  @UseGuards(UserAuthGuard)
  public async update(
    @Param('id') id: string,
    @Req() req: Request & { user: { userId: string } },
    @Body() dto: SavePatchDto,
  ): Promise<PatchListItem> {
    return this.patchService.update(id, req.user.userId, dto);
  }
}
