export enum ArticleCategory {
  DEVELOPMENT = 'DEVELOPMENT',
  MUSIC = 'MUSIC',
  AUDIO_ENGINEERING = 'AUDIO_ENGINEERING',
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: ArticleCategory;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
