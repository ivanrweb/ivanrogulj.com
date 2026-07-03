export namespace JaminiApi {
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

  export interface SaveLickPayload {
    name?: string;
    startSeconds: number;
    endSeconds: number;
    playbackRate?: number;
  }
}
