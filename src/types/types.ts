/**
 * Notion APIのレスポンス型定義
 * @description Notion APIから取得するデータの型を定義
 */

import { RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

/**
 * リッチテキストの注釈情報
 */
export interface TextAnnotations {
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
}

/**
 * Notionのリッチテキスト項目
 */
export interface NotionRichText {
  type: 'text';
  text: {
    content: string;
    link?: { url: string } | null;
  };
  annotations: TextAnnotations;
  plain_text: string;
  href?: string | null;
}

/**
 * Notionの日付プロパティ
 */
export interface NotionDate {
  id: string;
  type: 'date';
  date: {
    start: string;
    end?: string | null;
    time_zone?: string | null;
  } | null;
}

/**
 * Notionのタイトルプロパティ
 */
export interface NotionTitle {
  id: string;
  type: 'title';
  title: Array<RichTextItemResponse>;
}

/**
 * Notionのリッチテキストプロパティ
 */
export interface NotionRichTextProperty {
  id: string;
  type: 'rich_text';
  rich_text: Array<RichTextItemResponse>;
}

/**
 * Notionのチェックボックスプロパティ
 */
export interface NotionCheckbox {
  id: string;
  type: 'checkbox';
  checkbox: boolean;
}

/**
 * ブログ記事の型定義
 */
export interface BlogPost {
  id: string;
  last_edited_time: string;
  created_time: string;
  properties: {
    Title: NotionTitle;
    Date: NotionDate;
    Description: NotionRichTextProperty;
    Published: NotionCheckbox;
    Tags?: NotionRichTextProperty;
    Status?: {
      id: string;
      type: 'status';
      status: {
        id: string;
        name: string;
        color: string;
      } | null;
    };
  };
  content?: NotionBlock[];
}

/**
 * Notionブロックの基本型
 */
export interface NotionBlock {
  object: 'block';
  id: string;
  type: string;
  created_time: string;
  last_edited_time: string;
  created_by: { object: 'user'; id: string };
  last_edited_by: { object: 'user'; id: string };
  has_children: boolean;
  archived: boolean;
  [key: string]: unknown;
}

/**
 * パラグラフブロック
 */
export interface ParagraphBlock extends NotionBlock {
  type: 'paragraph';
  paragraph: {
    rich_text: NotionRichText[];
    color: string;
  };
}

/**
 * ヘッダーブロック（H1）
 */
export interface Heading1Block extends NotionBlock {
  type: 'heading_1';
  heading_1: {
    rich_text: NotionRichText[];
    color: string;
    is_toggleable: boolean;
  };
}

/**
 * ヘッダーブロック（H2）
 */
export interface Heading2Block extends NotionBlock {
  type: 'heading_2';
  heading_2: {
    rich_text: NotionRichText[];
    color: string;
    is_toggleable: boolean;
  };
}

/**
 * ヘッダーブロック（H3）
 */
export interface Heading3Block extends NotionBlock {
  type: 'heading_3';
  heading_3: {
    rich_text: NotionRichText[];
    color: string;
    is_toggleable: boolean;
  };
}

/**
 * コードブロック
 */
export interface CodeBlock extends NotionBlock {
  type: 'code';
  code: {
    caption: NotionRichText[];
    rich_text: NotionRichText[];
    language: string;
  };
}

/**
 * APIエラーレスポンス
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * API成功レスポンス
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  has_more: boolean;
  next_cursor?: string | null;
  total_count?: number;
  page_size: number;
}

/**
 * 検索フィルター
 */
export interface SearchFilters {
  tags?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  status?: string;
  query?: string;
}

/**
 * レート制限情報
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  window: number;
} 