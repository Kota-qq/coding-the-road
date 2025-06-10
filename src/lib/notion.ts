/**
 * Notion API クライアント
 * @description Notion APIを使用してブログ記事を取得・管理するためのクライアント
 */

import { Client } from '@notionhq/client';
import { cache } from 'react';
import { 
  PageObjectResponse, 
  RichTextItemResponse,
  DatabaseObjectResponse 
} from '@notionhq/client/build/src/api-endpoints';
import { getEnv } from './env';
import { BlogPost, NotionBlock, ApiError } from '@/types/types';

/**
 * Notion APIクライアントの初期化
 */
function createNotionClient(): Client {
  const env = getEnv();
  
  return new Client({
    auth: env.NOTION_API_KEY,
    timeoutMs: 30000, // 30秒タイムアウト
  });
}

/**
 * レイジー初期化されたNotionクライアント
 */
let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    notionClient = createNotionClient();
  }
  return notionClient;
}

/**
 * Notion APIエラーをハンドリング
 * @param error - キャッチされたエラー
 * @param context - エラーのコンテキスト情報
 * @returns 標準化されたエラー
 */
function handleNotionError(error: unknown, context: string): ApiError {
  console.error(`Notion API Error in ${context}:`, error);
  
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'NOTION_API_ERROR',
      details: { context, originalError: error.name }
    };
  }
  
  return {
    message: 'Unknown error occurred',
    code: 'UNKNOWN_ERROR',
    details: { context }
  };
}

/**
 * PageObjectResponseをBlogPostに変換
 * @param page - Notion API のページレスポンス
 * @returns 変換されたブログ記事
 */
function transformPageToBlogPost(page: PageObjectResponse): BlogPost {
  return {
    id: page.id,
    last_edited_time: page.last_edited_time,
    created_time: page.created_time,
    properties: page.properties as BlogPost['properties'],
  };
}

/**
 * リッチテキストから純粋なテキストを抽出
 * @param richText - Notionのリッチテキスト配列
 * @returns 抽出されたテキスト
 */
export function extractPlainText(richText: RichTextItemResponse[]): string {
  return richText
    .map(item => item.plain_text)
    .join('')
    .trim();
}

/**
 * 記事のタイトルを取得
 * @param post - ブログ記事
 * @returns 記事のタイトル
 */
export function getPostTitle(post: BlogPost): string {
  return extractPlainText(post.properties.Title.title) || 'Untitled';
}

/**
 * 記事の説明を取得
 * @param post - ブログ記事
 * @returns 記事の説明
 */
export function getPostDescription(post: BlogPost): string {
  return extractPlainText(post.properties.Description.rich_text) || '';
}

/**
 * 記事の投稿日を取得
 * @param post - ブログ記事
 * @returns 投稿日（ISO文字列）
 */
export function getPostDate(post: BlogPost): string {
  return post.properties.Date.date?.start || '';
}

/**
 * 記事の投稿日をフォーマット
 * @param post - ブログ記事
 * @param locale - ロケール（デフォルト: 'ja-JP'）
 * @returns フォーマットされた日付
 */
export function formatPostDate(post: BlogPost, locale = 'ja-JP'): string {
  const date = getPostDate(post);
  if (!date) return '';
  
  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch {
    return date;
  }
}

/**
 * 記事が公開されているかどうかを取得
 * @param post - ブログ記事
 * @returns 公開状態
 */
export function isPostPublished(post: BlogPost): boolean {
  return post.properties.Published?.checkbox || false;
}

/**
 * 公開されているブログ記事を取得
 * @description キャッシュ機能付きで全ての公開記事を取得
 * @returns ブログ記事の配列
 * @throws ApiError - Notion API呼び出しに失敗した場合
 */
export const getPosts = cache(async (): Promise<BlogPost[]> => {
  try {
    const env = getEnv();
    const notion = getNotionClient();
    
    console.log('📚 Fetching posts from Notion...');
    
    const response = await notion.databases.query({
      database_id: env.NOTION_DATABASE_ID,
      filter: {
        property: 'Published',
        checkbox: {
          equals: true // 公開済み（チェックされた）記事のみ取得
        }
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    const posts = response.results
      .filter((page): page is PageObjectResponse => 'properties' in page)
      .map(transformPageToBlogPost);
    
    console.log(`✅ Successfully fetched ${posts.length} posts`);
    return posts;
    
  } catch (error) {
    const apiError = handleNotionError(error, 'getPosts');
    throw new Error(`Failed to fetch posts: ${apiError.message}`);
  }
});

/**
 * 指定されたIDのブログ記事を取得
 * @param pageId - 記事のID
 * @returns ブログ記事（見つからない場合はnull）
 * @throws ApiError - Notion API呼び出しに失敗した場合
 */
export async function getPostById(pageId: string): Promise<BlogPost | null> {
  if (!pageId || typeof pageId !== 'string') {
    console.warn('Invalid pageId provided to getPostById:', pageId);
    return null;
  }
  
  try {
    const notion = getNotionClient();
    
    console.log(`📖 Fetching post with ID: ${pageId}`);
    
    // ページ情報を取得
    const page = await notion.pages.retrieve({ 
      page_id: pageId 
    }) as PageObjectResponse;
    
    // ページのブロックを取得
    const blocks = await notion.blocks.children.list({ 
      block_id: pageId,
      page_size: 100 // 最大100ブロック
    });
    
    const post = transformPageToBlogPost(page);
    post.content = blocks.results as NotionBlock[];
    
    console.log(`✅ Successfully fetched post: ${getPostTitle(post)}`);
    return post;
    
  } catch (error) {
    const apiError = handleNotionError(error, `getPostById(${pageId})`);
    
    // 404エラーの場合はnullを返す
    if (apiError.message.includes('not found') || apiError.message.includes('404')) {
      console.warn(`Post not found: ${pageId}`);
      return null;
    }
    
    throw new Error(`Failed to fetch post: ${apiError.message}`);
  }
}

/**
 * データベース情報を取得
 * @description Notionデータベースのメタデータを取得
 * @returns データベース情報
 */
export async function getDatabaseInfo(): Promise<DatabaseObjectResponse> {
  try {
    const env = getEnv();
    const notion = getNotionClient();
    
    const database = await notion.databases.retrieve({
      database_id: env.NOTION_DATABASE_ID
    }) as DatabaseObjectResponse;
    
    console.log(`📊 Database info: ${database.title[0]?.plain_text || 'Untitled'}`);
    return database;
    
  } catch (error) {
    const apiError = handleNotionError(error, 'getDatabaseInfo');
    throw new Error(`Failed to fetch database info: ${apiError.message}`);
  }
}

/**
 * 最新の記事を指定数取得
 * @param limit - 取得する記事数（デフォルト: 4）
 * @returns 最新記事の配列
 */
export async function getLatestPosts(limit = 4): Promise<BlogPost[]> {
  try {
    const allPosts = await getPosts();
    return allPosts
      .sort((a, b) => {
        const dateA = getPostDate(a);
        const dateB = getPostDate(b);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .slice(0, limit);
  } catch (error) {
    const apiError = handleNotionError(error, 'getLatestPosts');
    throw new Error(`Failed to fetch latest posts: ${apiError.message}`);
  }
}

/**
 * 記事の総数を取得
 * @returns 公開記事の総数
 */
export async function getPostsCount(): Promise<number> {
  try {
    const posts = await getPosts();
    return posts.length;
  } catch (error) {
    console.error('Failed to get posts count:', error);
    return 0;
  }
}

/**
 * Notion API接続テスト
 * @description APIキーとデータベースIDの有効性をテスト
 * @returns 接続テストの結果
 */
export async function testNotionConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await getDatabaseInfo();
    return { 
      success: true, 
      message: 'Notion connection successful' 
    };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 