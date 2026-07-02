export namespace PracticeJamApi {
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
    setlistIds: string[];
    createdAt: string;
  }

  export interface JamDetail {
    jam: Jam;
    phrases: Phrase[];
    setlistIds: string[];
  }

  export interface Phrase {
    id: string;
    jamId: string;
    name: string;
    startSeconds: number;
    endSeconds: number;
    playbackRate: number;
    sortOrder: number;
    createdAt: string;
  }

  export interface Setlist {
    id: string;
    name: string;
    createdAt: string;
  }

  export interface CreateJamPayload {
    youtubeUrl: string;
    name?: string;
    setlistIds?: string[];
  }

  export interface UpdateJamPayload {
    name?: string;
    durationSeconds?: number | null;
  }

  export interface SavePhrasePayload {
    name?: string;
    startSeconds: number;
    endSeconds: number;
    playbackRate?: number;
  }
}
