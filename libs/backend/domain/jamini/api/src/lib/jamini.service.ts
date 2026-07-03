import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
  JamEntity,
  JamRepository,
  JamCategoryRepository,
  LickEntity,
  LickRepository,
  CategoryEntity,
  CategoryRepository,
} from '@ivanrogulj.com/backend/domain/jamini/data-access';
import { AssignCategoriesDto, CreateJamDto, SaveLickDto, CategoryDto, UpdateJamDto } from './dto/jamini.dto';

export interface JamListItem {
  id: string;
  name: string;
  youtubeVideoId: string;
  categoryIds: string[];
  createdAt: Date;
}

export interface JamDetail {
  jam: JamEntity;
  licks: LickEntity[];
  categoryIds: string[];
}

@Injectable()
export class JaminiService {
  public constructor(
    private readonly jamRepo: JamRepository,
    private readonly lickRepo: LickRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly jamCategoryRepo: JamCategoryRepository,
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

    const categoryIds = await this.linkCategories(jam.id, userId, dto.categoryIds ?? []);

    return { id: jam.id, name: jam.name, youtubeVideoId: jam.youtubeVideoId, categoryIds, createdAt: jam.createdAt };
  }

  public async listJams(userId: string): Promise<JamListItem[]> {
    const jams = await this.jamRepo.findByUserId(userId);
    const links = await this.jamCategoryRepo.findByJamIds(jams.map((j) => j.id));
    return jams.map((jam) => ({
      id: jam.id,
      name: jam.name,
      youtubeVideoId: jam.youtubeVideoId,
      categoryIds: links.filter((l) => l.jamId === jam.id).map((l) => l.categoryId),
      createdAt: jam.createdAt,
    }));
  }

  public async getJam(id: string, userId: string): Promise<JamDetail> {
    const jam = await this.findOwnedJam(id, userId);
    const licks = await this.lickRepo.findByJamId(id);
    const links = await this.jamCategoryRepo.findByJamId(id);
    return { jam, licks: licks, categoryIds: links.map((l) => l.categoryId) };
  }

  public async updateJam(id: string, userId: string, dto: UpdateJamDto): Promise<JamListItem> {
    const jam = await this.findOwnedJam(id, userId);
    if (dto.name !== undefined) jam.name = dto.name.trim() || jam.name;
    if (dto.durationSeconds !== undefined) jam.durationSeconds = dto.durationSeconds;
    const saved = await this.jamRepo.save(jam);
    const links = await this.jamCategoryRepo.findByJamId(id);
    return {
      id: saved.id,
      name: saved.name,
      youtubeVideoId: saved.youtubeVideoId,
      categoryIds: links.map((l) => l.categoryId),
      createdAt: saved.createdAt,
    };
  }

  public async deleteJam(id: string, userId: string): Promise<void> {
    await this.findOwnedJam(id, userId);
    await this.lickRepo.delete({ jamId: id });
    await this.jamCategoryRepo.delete({ jamId: id });
    await this.jamRepo.delete(id);
  }

  public async setJamCategories(id: string, userId: string, dto: AssignCategoriesDto): Promise<string[]> {
    await this.findOwnedJam(id, userId);
    await this.jamCategoryRepo.delete({ jamId: id });
    return this.linkCategories(id, userId, dto.categoryIds);
  }

  public async addLick(jamId: string, userId: string, dto: SaveLickDto): Promise<LickEntity> {
    await this.findOwnedJam(jamId, userId);
    this.validateLickRange(dto);
    const existing = await this.lickRepo.findByJamId(jamId);
    return this.lickRepo.save(
      this.lickRepo.create({
        jamId,
        name: dto.name?.trim() || this.defaultLickName(dto.startSeconds, dto.endSeconds),
        startSeconds: dto.startSeconds,
        endSeconds: dto.endSeconds,
        playbackRate: dto.playbackRate ?? 1,
        sortOrder: existing.length,
      }),
    );
  }

  public async updateLick(id: string, userId: string, dto: SaveLickDto): Promise<LickEntity> {
    const lick = await this.findOwnedLick(id, userId);
    this.validateLickRange(dto);
    lick.name = dto.name?.trim() || lick.name;
    lick.startSeconds = dto.startSeconds;
    lick.endSeconds = dto.endSeconds;
    lick.playbackRate = dto.playbackRate ?? lick.playbackRate;
    return this.lickRepo.save(lick);
  }

  public async deleteLick(id: string, userId: string): Promise<void> {
    await this.findOwnedLick(id, userId);
    await this.lickRepo.delete(id);
  }

  public async listCategories(userId: string): Promise<CategoryEntity[]> {
    return this.categoryRepo.findByUserId(userId);
  }

  public async createCategory(userId: string, dto: CategoryDto): Promise<CategoryEntity> {
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Category name is required');
    return this.categoryRepo.save(this.categoryRepo.create({ userId, name }));
  }

  public async renameCategory(id: string, userId: string, dto: CategoryDto): Promise<CategoryEntity> {
    const category = await this.findOwnedCategory(id, userId);
    const name = dto.name?.trim();
    if (!name) throw new BadRequestException('Category name is required');
    category.name = name;
    return this.categoryRepo.save(category);
  }

  public async deleteCategory(id: string, userId: string): Promise<void> {
    await this.findOwnedCategory(id, userId);
    await this.jamCategoryRepo.delete({ categoryId: id });
    await this.categoryRepo.delete(id);
  }

  private async findOwnedJam(id: string, userId: string): Promise<JamEntity> {
    const jam = await this.jamRepo.findOne({ where: { id } });
    if (!jam) throw new NotFoundException('Jam not found');
    if (jam.userId !== userId) throw new ForbiddenException('Not your jam');
    return jam;
  }

  private async findOwnedLick(id: string, userId: string): Promise<LickEntity> {
    const lick = await this.lickRepo.findOne({ where: { id } });
    if (!lick) throw new NotFoundException('Lick not found');
    await this.findOwnedJam(lick.jamId, userId);
    return lick;
  }

  private async findOwnedCategory(id: string, userId: string): Promise<CategoryEntity> {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId) throw new ForbiddenException('Not your category');
    return category;
  }

  /** Inserts join rows for categories the user actually owns; returns the linked ids. */
  private async linkCategories(jamId: string, userId: string, categoryIds: string[]): Promise<string[]> {
    if (categoryIds.length === 0) return [];
    const owned = await this.categoryRepo.findByUserId(userId);
    const ownedIds = new Set(owned.map((s) => s.id));
    const validIds = [...new Set(categoryIds)].filter((id) => ownedIds.has(id));
    await this.jamCategoryRepo.save(validIds.map((categoryId) => this.jamCategoryRepo.create({ jamId, categoryId })));
    return validIds;
  }

  private validateLickRange(dto: SaveLickDto): void {
    if (
      typeof dto.startSeconds !== 'number' ||
      typeof dto.endSeconds !== 'number' ||
      dto.startSeconds < 0 ||
      dto.endSeconds <= dto.startSeconds
    ) {
      throw new BadRequestException('Invalid lick range');
    }
  }

  private defaultLickName(startSeconds: number, endSeconds: number): string {
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
