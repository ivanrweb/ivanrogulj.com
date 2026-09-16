export namespace JaminiApi {
  /**
   * Assigned round-robin when a Lick is created, so a Lick keeps its colour across
   * reorders. Avoids #66fcf1 (the active Lick ring) and #ff007f (the mark selection).
   */
  export const LICK_COLORS = [
    '#ff6b6b',
    '#ffa94d',
    '#ffd43b',
    '#a9e34b',
    '#69db7c',
    '#4dabf7',
    '#b197fc',
    '#e599f7',
  ];

  export interface Jam {
    id: string;
    name: string;
    youtubeVideoId: string;
    youtubeUrl: string;
    durationSeconds: number | null;
    createdAt: string;
    updatedAt: string;
  }

  export interface JamListItem {
    id: string;
    name: string;
    youtubeVideoId: string;
    categoryIds: string[];
    createdAt: string;
  }

  export interface JamDetail {
    jam: Jam;
    licks: Lick[];
    categoryIds: string[];
  }

  export interface Lick {
    id: string;
    jamId: string;
    name: string;
    startSeconds: number;
    endSeconds: number;
    playbackRate: number;
    sortOrder: number;
    /** Null only for Licks created before colours existed; the API backfills them on read. */
    color: string | null;
    createdAt: string;
  }

  export interface Category {
    id: string;
    name: string;
    createdAt: string;
  }

  export interface CreateJamPayload {
    youtubeUrl: string;
    name?: string;
    categoryIds?: string[];
  }

  export interface UpdateJamPayload {
    name?: string;
    durationSeconds?: number | null;
  }

  export interface ReorderLicksPayload {
    lickIds: string[];
  }

  export interface SaveLickPayload {
    name?: string;
    startSeconds: number;
    endSeconds: number;
    playbackRate?: number;
  }
}
