import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  JamEntity,
  JamRepository,
  JamSetlistRepository,
  PhraseEntity,
  PhraseRepository,
  SetlistEntity,
  SetlistRepository,
} from '@ivanrogulj.com/backend/domain/practice-jam/data-access';
import { AssignSetlistsDto, CreateJamDto, SavePhraseDto, SetlistDto, UpdateJamDto } from './dto/practice-jam.dto';

export interface JamListItem {
  id: string;
  name: string;
  youtubeVideoId: string;
  setlistIds: string[];
  createdAt: Date;
}

export interface JamDetail {
  jam: JamEntity;
  phrases: PhraseEntity[];
  setlistIds: string[];
}

@Injectable()
export class PracticeJamService {
  public constructor(
    private readonly jamRepo: JamRepository,
    private readonly phraseRepo: PhraseRepository,
    private readonly setlistRepo: SetlistRepository,
    private readonly jamSetlistRepo: JamSetlistRepository,
  ) {}

  public async createJam(userId: string, dto: CreateJamDto): Promise<JamListItem> {
    const videoId = this.parseYoutubeId(dto.youtubeUrl);
    if (!videoId) throw new BadRequestException('Not a valid YouTube URL');

    const name = dto.name?.trim() || (await this.fetchYoutubeTitle(videoId)) || 'Untitled Jam';

    const jam = await this.jamRepo.save(
      this.jamRepo.create({
        userId,
        name,
        youtubeVideoId: videoId,
        youtubeUrl: dto.youtubeUrl,
        durationSeconds: null,
      }),
    );

    const setlistIds = await this.linkSetlists(jam.id, userId, dto.setlistIds ?? []);

    return { id: jam.id, name: jam.name, youtubeVideoId: jam.youtubeVideoId, setlistIds, createdAt: jam.createdAt };
  }

  public async listJams(userId: string): Promise<JamListItem[]> {
    const jams = await this.jamRepo.findByUserId(userId);
    const links = await this.jamSetlistRepo.findByJamIds(jams.map((j) => j.id));
    return jams.map((jam) => ({
      id: jam.id,
      name: jam.name,
      youtubeVideoId: jam.youtubeVideoId,
      setlistIds: links.filter((l) => l.jamId === jam.id).map((l) => l.setlistId),
      createdAt: jam.createdAt,
    }));
  }

  public async getJam(id: string, userId: string): Promise<JamDetail> {
    const jam = await this.findOwnedJam(id, userId);
    const phrases = await this.phraseRepo.findByJamId(id);
    const links = await this.jamSetlistRepo.findByJamId(id);
    return { jam, phrases, setlistIds: links.map((l) => l.setlistId) };
  }

  public async updateJam(id: string, userId: string, dto: UpdateJamDto): Promise<JamListItem> {
    const jam = await this.findOwnedJam(id, userId);
    if (dto.name !== undefined) jam.name = dto.name.trim() || jam.name;
    if (dto.durationSeconds !== undefined) jam.durationSeconds = dto.durationSeconds;
    const saved = await this.jamRepo.save(jam);
    const links = await this.jamSetlistRepo.findByJamId(id);
    return {
      id: saved.id,
      name: saved.name,
      youtubeVideoId: saved.youtubeVideoId,
      setlistIds: links.map((l) => l.setlistId),
      createdAt: saved.createdAt,
    };
  }

  public async deleteJam(id: string, userId: string): Promise<void> {
    await this.findOwnedJam(id, userId);
    await this.phraseRepo.delete({ jamId: id });
    await this.jamSetlistRepo.delete({ jamId: id });
    await this.jamRepo.delete(id);
  }

  public async setJamSetlists(id: string, userId: string, dto: AssignSetlistsDto): Promise<string[]> {
    await this.findOwnedJam(id, userId);
    await this.jamSetlistRepo.delete({ jamId: id });
    return this.linkSetlists(id, userId, dto.setlistIds);
  }

  public async addPhrase(jamId: string, userId: string, dto: SavePhraseDto): Promise<PhraseEntity> {
    await this.findOwnedJam(jamId, userId);
    this.validatePhraseRange(dto);
    const existing = await this.phraseRepo.findByJamId(jamId);
    return this.phraseRepo.save(
      this.phraseRepo.create({
        jamId,
        name: dto.name?.trim() || this.defaultPhraseName(dto.startSeconds, dto.endSeconds),
        startSeconds: dto.startSeconds,
        endSeconds: dto.endSeconds,
        playbackRate: dto.playbackRate ?? 1,
        sortOrder: existing.length,
      }),
    );
  }

  public async updatePhrase(id: string, userId: string, dto: SavePhraseDto): Promise<PhraseEntity> {
    const phrase = await this.findOwnedPhrase(id, userId);
    this.validatePhraseRange(dto);
    phrase.name = dto.name?.trim() || phrase.name;
    phrase.startSeconds = dto.startSeconds;
    phrase.endSeconds = dto.endSeconds;
    phrase.playbackRate = dto.playbackRate ?? phrase.playbackRate;
    return this.phraseRepo.save(phrase);
  }

  public async deletePhrase(id: string, userId: string): Promise<void> {
    await this.findOwnedPhrase(id, userId);
    await this.phraseRepo.delete(id);
  }

  public async listSetlists(userId: string): Promise<SetlistEntity[]> {
    return this.setlistRepo.findByUserId(userId);
  }

  public async createSetlist(userId: string, dto: SetlistDto): Promise<SetlistEntity> {
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Setlist name is required');
    return this.setlistRepo.save(this.setlistRepo.create({ userId, name }));
  }

  public async renameSetlist(id: string, userId: string, dto: SetlistDto): Promise<SetlistEntity> {
    const setlist = await this.findOwnedSetlist(id, userId);
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Setlist name is required');
    setlist.name = name;
    return this.setlistRepo.save(setlist);
  }

  public async deleteSetlist(id: string, userId: string): Promise<void> {
    await this.findOwnedSetlist(id, userId);
    await this.jamSetlistRepo.delete({ setlistId: id });
    await this.setlistRepo.delete(id);
  }

  private async findOwnedJam(id: string, userId: string): Promise<JamEntity> {
    const jam = await this.jamRepo.findOne({ where: { id } });
    if (!jam) throw new NotFoundException('Jam not found');
    if (jam.userId !== userId) throw new ForbiddenException('Not your jam');
    return jam;
  }

  private async findOwnedPhrase(id: string, userId: string): Promise<PhraseEntity> {
    const phrase = await this.phraseRepo.findOne({ where: { id } });
    if (!phrase) throw new NotFoundException('Phrase not found');
    await this.findOwnedJam(phrase.jamId, userId);
    return phrase;
  }

  private async findOwnedSetlist(id: string, userId: string): Promise<SetlistEntity> {
    const setlist = await this.setlistRepo.findOne({ where: { id } });
    if (!setlist) throw new NotFoundException('Setlist not found');
    if (setlist.userId !== userId) throw new ForbiddenException('Not your setlist');
    return setlist;
  }

  /** Inserts join rows for setlists the user actually owns; returns the linked ids. */
  private async linkSetlists(jamId: string, userId: string, setlistIds: string[]): Promise<string[]> {
    if (setlistIds.length === 0) return [];
    const owned = await this.setlistRepo.findByUserId(userId);
    const ownedIds = new Set(owned.map((s) => s.id));
    const validIds = [...new Set(setlistIds)].filter((id) => ownedIds.has(id));
    await this.jamSetlistRepo.save(validIds.map((setlistId) => this.jamSetlistRepo.create({ jamId, setlistId })));
    return validIds;
  }

  private validatePhraseRange(dto: SavePhraseDto): void {
    if (
      typeof dto.startSeconds !== 'number' ||
      typeof dto.endSeconds !== 'number' ||
      dto.startSeconds < 0 ||
      dto.endSeconds <= dto.startSeconds
    ) {
      throw new BadRequestException('Invalid phrase range');
    }
  }

  private defaultPhraseName(startSeconds: number, endSeconds: number): string {
    return `${this.formatTime(startSeconds)}-${this.formatTime(endSeconds)}`;
  }

  private formatTime(seconds: number): string {
    const total = Math.floor(seconds);
    const min = Math.floor(total / 60);
    const sec = total % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  /** Grabs the video title from YouTube's oEmbed endpoint; returns null on any failure. */
  private async fetchYoutubeTitle(videoId: string): Promise<string | null> {
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      );
      if (!response.ok) return null;
      const data = (await response.json()) as { title?: string };
      return data.title ?? null;
    } catch {
      return null;
    }
  }

  /** Extracts the video id from watch?v=, youtu.be/, embed/, shorts/ and live/ URLs. */
  private parseYoutubeId(url: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?(?:.*&)?v=)([\w-]{11})/,
      /(?:youtu\.be\/)([\w-]{11})/,
      /(?:youtube\.com\/embed\/)([\w-]{11})/,
      /(?:youtube\.com\/shorts\/)([\w-]{11})/,
      /(?:youtube\.com\/live\/)([\w-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
}
