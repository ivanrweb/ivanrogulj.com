export interface CreateJamDto {
  youtubeUrl: string;
  name?: string;
  categoryIds?: string[];
}

export interface UpdateJamDto {
  name?: string;
  durationSeconds?: number | null;
}

export interface SaveLickDto {
  name?: string;
  startSeconds: number;
  endSeconds: number;
  playbackRate?: number;
}

export interface CategoryDto {
  name: string;
}

export interface AssignCategoriesDto {
  categoryIds: string[];
}
