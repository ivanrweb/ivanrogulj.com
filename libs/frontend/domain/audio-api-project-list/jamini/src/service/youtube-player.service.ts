import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';

/** Minimal typings for the parts of the YouTube IFrame API we use. */
interface YtPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  getAvailablePlaybackRates(): number[];
  setPlaybackRate(suggestedRate: number): void;
  getPlayerState(): number;
  destroy(): void;
}

interface YtNamespace {
  Player: new (
    elementId: string,
    config: {
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    },
  ) => YtPlayer;
  PlayerState: { PLAYING: number };
}

declare global {
  interface Window {
    YT?: YtNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_API_SRC = 'https://www.youtube.com/iframe_api';
const TIME_POLL_INTERVAL_MS = 100;

export interface PlayerReadyInfo {
  duration: number;
  availableRates: number[];
}

/**
 * Browser-only wrapper around the YouTube IFrame API: loads the script once,
 * owns a single player instance and polls the playhead position.
 */
@Injectable({ providedIn: 'root' })
export class YoutubePlayerService {
  private readonly platformId = inject(PLATFORM_ID);

  private apiReadyPromise: Promise<void> | null = null;
  private player: YtPlayer | null = null;
  private pollHandle: ReturnType<typeof setInterval> | null = null;

  public readonly time$ = new Subject<number>();
  public readonly playing$ = new Subject<boolean>();

  public async createPlayer(elementId: string, videoId: string): Promise<PlayerReadyInfo> {
    if (!isPlatformBrowser(this.platformId)) {
      return { duration: 0, availableRates: [1] };
    }
    await this.loadApi();
    this.destroyPlayer();

    return new Promise<PlayerReadyInfo>((resolve) => {
      const yt = window.YT as YtNamespace;
      this.player = new yt.Player(elementId, {
        videoId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: (): void => {
            this.startPolling();
            resolve({
              duration: this.player?.getDuration() ?? 0,
              availableRates: this.player?.getAvailablePlaybackRates() ?? [1],
            });
          },
          onStateChange: (event): void => {
            this.playing$.next(event.data === yt.PlayerState.PLAYING);
          },
        },
      });
    });
  }

  public play(): void {
    this.player?.playVideo();
  }

  public pause(): void {
    this.player?.pauseVideo();
  }

  public seekTo(seconds: number): void {
    this.player?.seekTo(seconds, true);
  }

  public setPlaybackRate(rate: number): void {
    this.player?.setPlaybackRate(rate);
  }

  public getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  public getDuration(): number {
    return this.player?.getDuration() ?? 0;
  }

  public destroyPlayer(): void {
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
    this.player?.destroy();
    this.player = null;
  }

  private loadApi(): Promise<void> {
    if (this.apiReadyPromise) return this.apiReadyPromise;

    this.apiReadyPromise = new Promise<void>((resolve) => {
      if (window.YT?.Player) {
        resolve();
        return;
      }
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = (): void => {
        previousCallback?.();
        resolve();
      };
      if (!document.querySelector(`script[src="${YT_API_SRC}"]`)) {
        const script = document.createElement('script');
        script.src = YT_API_SRC;
        document.head.appendChild(script);
      }
    });
    return this.apiReadyPromise;
  }

  private startPolling(): void {
    if (this.pollHandle !== null) clearInterval(this.pollHandle);
    this.pollHandle = setInterval(() => {
      if (this.player) {
        this.time$.next(this.player.getCurrentTime());
      }
    }, TIME_POLL_INTERVAL_MS);
  }
}
