import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SongChordsRepository, SongChordsEntity } from '@ivanrogulj.com/backend/domain/song-chords/data-access';
import { SaveSongChordsDto } from './dto/save-song-chords.dto';

export interface SongChordsListItem {
  id: string;
  title: string;
  createdAt: Date;
}

export interface SongChordsDetail {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class SongChordsService {
  public constructor(private readonly repo: SongChordsRepository) {}

  public async save(userId: string, dto: SaveSongChordsDto): Promise<SongChordsListItem> {
    const entity = this.repo.create({ userId, title: dto.title, content: dto.content });
    const saved = await this.repo.save(entity);
    return { id: saved.id, title: saved.title, createdAt: saved.createdAt };
  }

  public async findByUser(userId: string): Promise<SongChordsListItem[]> {
    const list = await this.repo.findByUserId(userId);
    return list.map((s) => ({ id: s.id, title: s.title, createdAt: s.createdAt }));
  }

  public async findOne(id: string, userId: string): Promise<SongChordsDetail> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity || entity.userId !== userId) throw new NotFoundException('Song not found');
    return { id: entity.id, title: entity.title, content: entity.content, createdAt: entity.createdAt, updatedAt: entity.updatedAt };
  }

  public async update(id: string, userId: string, dto: SaveSongChordsDto): Promise<SongChordsListItem> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Song not found');
    if (entity.userId !== userId) throw new ForbiddenException('Not your song');
    await this.repo.update(id, { title: dto.title, content: dto.content });
    return { id, title: dto.title, createdAt: entity.createdAt };
  }

  public async delete(id: string, userId: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Song not found');
    if (entity.userId !== userId) throw new ForbiddenException('Not your song');
    await this.repo.delete(id);
  }
}
