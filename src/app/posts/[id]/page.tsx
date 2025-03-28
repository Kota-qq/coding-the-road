import { getPostById, getPosts } from '@/lib/notion';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import type { NotionPost, NotionBlock } from '@/lib/notion';  // 型をインポート

// anyの型を修正
interface RichTextContent {
  annotations?: {
    bold?: boolean;
    code?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
  };
  text?: {
    content?: string;
  };
}

// Notionのブロックを変換するヘルパー関数
function renderBlock(block: NotionBlock) {
  if (!block) return null;
  
  const { type } = block;
  const value = block[type] as { rich_text?: Array<RichTextContent> };

  if (!value) return null;

  switch (type) {
    case 'paragraph':
      return (
        <p className="mb-4 text-zinc-600">
          {value.rich_text?.map((text: RichTextContent, i: number) => {
            if (!text) return null;
            
            const {
              annotations: { bold, code, italic, strikethrough, underline } = {},
              text: { content } = {},
            } = text;
            
            if (!content) return null;
            
            // テキストのスタイリング
            if (bold) return <strong key={i}>{content}</strong>;
            if (code) return <code key={i} className="bg-zinc-100 px-2 py-1 rounded">{content}</code>;
            if (italic) return <em key={i}>{content}</em>;
            if (strikethrough) return <del key={i}>{content}</del>;
            if (underline) return <u key={i}>{content}</u>;
            
            return content;
          }) || ''}
        </p>
      );
    case 'heading_1':
      return (
        <h1 className="text-3xl font-bold text-zinc-900 mb-4 mt-8">
          {value.rich_text?.[0]?.text?.content || ''}
        </h1>
      );
    case 'heading_2':
      return (
        <h2 className="text-2xl font-bold text-zinc-900 mb-4 mt-6">
          {value.rich_text?.[0]?.text?.content || ''}
        </h2>
      );
    case 'heading_3':
      return (
        <h3 className="text-xl font-bold text-zinc-900 mb-3 mt-5">
          {value.rich_text?.[0]?.text?.content || ''}
        </h3>
      );
    case 'bulleted_list_item':
      return (
        <li className="ml-6 mb-2 text-zinc-600">
          {value.rich_text?.[0]?.text?.content || ''}
        </li>
      );
    case 'numbered_list_item':
      return (
        <li className="ml-6 mb-2 list-decimal text-zinc-600">
          {value.rich_text?.[0]?.text?.content || ''}
        </li>
      );
    default:
      return null;
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);
  if (!post) {
    return {
      title: 'Not Found',
      description: 'ページが見つかりませんでした。',
    };
  }

  const title = post.properties?.Title?.title?.[0]?.plain_text || 'No Title';
  const description = post.properties?.Description?.rich_text?.[0]?.plain_text || '';

  return {
    title: title,
    description: description,
    openGraph: {
      title: `${title} | Coding the Road`,
      description: description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Coding the Road`,
      description: description,
    }
  };
}

export default async function PostPage(
  { params }: PageProps
) {
  const resolvedParams = await params;
  const post = await getPostById(resolvedParams.id);
  const allPosts = await getPosts() as NotionPost[];

  if (!post) {
    notFound();
  }

  const title = post.properties?.Title?.title?.[0]?.plain_text || 'No Title';
  const date = post.properties?.Date?.date?.start 
    ? new Date(post.properties.Date.date.start).toLocaleDateString('ja-JP')
    : '日付なし';

  // 現在の記事のIDを変数に保存
  const currentPostId = post.id;

  // 関連記事を取得（最新の3記事、ただし現在の記事は除く）
  const relatedPosts = allPosts
    .filter(p => p.id !== currentPostId)
    .sort((a, b) => {
      const dateA = a.properties.Date?.date?.start || '';
      const dateB = b.properties.Date?.date?.start || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      <div className="pt-32 pb-20 container mx-auto px-6">
        <article className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link
              href="/articles"
              className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="font-mono text-4xl font-bold text-zinc-900 mb-4">
              {title}
            </h1>
            <div className="flex items-center text-zinc-600 text-sm">
              <time>{date}</time>
            </div>
          </div>

          <div className="prose prose-zinc max-w-none">
            <div className="mt-8">
              {post.content?.map((
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                block: any
              ) => (
                <div key={block.id}>
                  {renderBlock(block)}
                </div>
              )) || <p>コンテンツがありません</p>}
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-zinc-200">
            <Link
              href="/articles"
              className="inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Link>
          </div>

          {/* 関連記事セクション */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t border-zinc-200">
              <h2 className="font-mono text-2xl font-bold text-zinc-900 mb-6">
                RELATED ARTICLES
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => {
                  const relatedTitle = relatedPost.properties.Title?.title?.[0]?.plain_text || 'Untitled';
                  const relatedDate = relatedPost.properties.Date?.date?.start
                    ? new Date(relatedPost.properties.Date.date.start).toLocaleDateString('ja-JP')
                    : '日付なし';

                  return (
                    <Link
                      key={relatedPost.id}
                      href={`/posts/${relatedPost.id}`}
                      className="block bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-bold text-zinc-900 mb-2 line-clamp-2">
                        {relatedTitle}
                      </h3>
                      <time className="text-sm text-zinc-500">
                        {relatedDate}
                      </time>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
} 