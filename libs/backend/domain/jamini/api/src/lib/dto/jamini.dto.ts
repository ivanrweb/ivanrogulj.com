import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateJamDto {
  @IsString()
  public youtubeUrl!: string;

  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  public categoryIds?: string[];
}

export class UpdateJamDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsOptional()
  @IsNumber()
  public durationSeconds?: number | null;
}

export class SaveLickDto {
  @IsOptional()
  @IsString()
  public name?: string;

  @IsNumber()
  public startSeconds!: number;

  @IsNumber()
  public endSeconds!: number;

  @IsOptional()
  @IsNumber()
  public playbackRate?: number;
}

export class CategoryDto {
  @IsString()
  public name!: string;
}

export class AssignCategoriesDto {
  @IsArray()
  @IsString({ each: true })
  public categoryIds!: string[];
}
