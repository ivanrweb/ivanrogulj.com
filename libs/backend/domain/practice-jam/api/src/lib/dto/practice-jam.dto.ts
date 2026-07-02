export interface CreateJamDto {
  youtubeUrl: string;
  name?: string;
  setlistIds?: string[];
}

export interface UpdateJamDto {
  name?: string;
  durationSeconds?: number | null;
}

export interface SavePhraseDto {
  name?: string;
  startSeconds: number;
  endSeconds: number;
  playbackRate?: number;
}

export interface SetlistDto {
  name: string;
}

export interface AssignSetlistsDto {
  setlistIds: string[];
}
