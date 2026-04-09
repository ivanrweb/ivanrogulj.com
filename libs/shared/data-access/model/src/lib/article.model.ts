export interface Article {
  id: string;
  title: string;
  slug: string;
  mediumUrl: string;
  publishedAt: string;
  excerpt: string;
  content?: string;
  coverImage: string | null;
  tags: string[];
}
