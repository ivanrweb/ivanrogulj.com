import { Injectable, Logger } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const RssParser = require('rss-parser');

export interface MediumArticle {
  id: string;
  title: string;
  slug: string;
  mediumUrl: string;
  publishedAt: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  tags: string[];
}

@Injectable()
export class MediumService {
  private readonly logger = new Logger(MediumService.name);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  private readonly parser = new RssParser({
    customFields: {
      item: [
        ['content:encoded', 'contentEncoded'],
        ['dc:creator', 'creator'],
      ],
    },
  });

  private cache: MediumArticle[] | null = null;
  private cacheExpiresAt = 0;
  private readonly cacheTtlMs = 15 * 60 * 1000; // 15 minutes

  private get feedUrl(): string {
    const username = process.env['MEDIUM_USERNAME'] ?? '@placeholder';
    return `https://medium.com/feed/${username}`;
  }

  public async getAll(): Promise<MediumArticle[]> {
    if (this.cache && Date.now() < this.cacheExpiresAt) {
      return this.cache;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const feed = await this.parser.parseURL(this.feedUrl);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const articles = (
        (feed.items ?? []) as {
          title?: string;
          link?: string;
          guid?: string;
          pubDate?: string;
          isoDate?: string;
          categories?: string[];
          content?: string;
          contentEncoded?: string;
        }[]
      ).map((item) => this.mapItem(item));
      this.cache = articles;
      this.cacheExpiresAt = Date.now() + this.cacheTtlMs;
      return articles;
    } catch (err) {
      this.logger.warn(
        `Failed to fetch Medium RSS feed: ${(err as Error).message}`
      );
      return this.cache ?? [];
    }
  }

  public async getBySlug(slug: string): Promise<MediumArticle | null> {
    const all = await this.getAll();
    return all.find((a) => a.slug === slug) ?? null;
  }

  private mapItem(item: {
    title?: string;
    link?: string;
    guid?: string;
    pubDate?: string;
    isoDate?: string;
    categories?: string[];
    content?: string;
    contentEncoded?: string;
  }): MediumArticle {
    const link = item.link ?? '';
    const slug = this.extractSlug(link);
    const content = item.contentEncoded ?? item.content ?? '';
    const coverImage = this.extractCoverImage(content);
    const excerpt = this.extractExcerpt(content);

    return {
      id: item.guid ?? link,
      title: item.title ?? '',
      slug,
      mediumUrl: link,
      publishedAt: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
      excerpt,
      content,
      coverImage,
      tags: Array.isArray(item.categories) ? item.categories : [],
    };
  }

  private extractSlug(url: string): string {
    // Medium URLs end with a hash: /title-of-article-abc123
    // Use the last path segment as slug
    try {
      const path = new URL(url).pathname;
      return path.split('/').filter(Boolean).pop() ?? url;
    } catch {
      return url;
    }
  }

  private extractCoverImage(html: string): string | null {
    const match = html.match(/<img[^>]+src="([^"]+)"/);
    return match ? match[1] : null;
  }

  private extractExcerpt(html: string): string {
    const text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.length > 200 ? text.slice(0, 200) + '...' : text;
  }
}
