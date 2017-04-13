export interface Article {
  title: string;
  author: string | null;
  content: string;
  date_published: string | null,
  lead_image_url: string | null;
  dek: string | null;
  url: string;
  domain: string;
  excerpt: string;
  word_count: number;
  direction: string;
  total_pages: number;
  rendered_pages: number;
  next_page_url: string | null;
}
