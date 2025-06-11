import { getPostById, getPosts } from '@/lib/notion';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import type { BlogPost } from '@/types/types';
import NotionBlocks from '@/components/NotionBlocks';

// ページキャッシュ設定
export const revalidate = 3600; // 1時間

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
  const allPosts = await getPosts() as BlogPost[];

  if (!post) {
    notFound();
  }

  const title = post.properties?.Title?.title?.[0]?.plain_text || 'No Title';
  const description = post.properties?.Description?.rich_text?.[0]?.plain_text || '';
  const date = post.properties?.Date?.date?.start 
    ? new Date(post.properties.Date.date.start).toLocaleDateString('ja-JP')
    : '日付なし';
  const isoDate = post.properties?.Date?.date?.start || new Date().toISOString();

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

  // 構造化データ（JSON-LD）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": "https://codingtheroad.com/logo.webp",
    "datePublished": isoDate,
    "dateModified": post.last_edited_time || isoDate,
    "author": {
      "@type": "Person",
      "name": "Kota",
      "url": "https://twitter.com/kota_qq"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Coding the Road",
      "logo": {
        "@type": "ImageObject",
        "url": "https://codingtheroad.com/logo.webp"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://codingtheroad.com/posts/${post.id}`
    },
    "url": `https://codingtheroad.com/posts/${post.id}`,
    "wordCount": post.content?.length || 0,
    "genre": ["プログラミング", "技術", "Web開発"],
    "keywords": ["プログラミング", "エンジニア", "技術記事", "Web開発"]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
        <div className="pt-32 pb-20 container mx-auto px-6">
          <article className="max-w-3xl mx-auto">
            {/* パンくずリスト */}
            <nav className="mb-8" aria-label="パンくずリスト">
              <ol className="flex items-center space-x-2 text-sm text-zinc-600">
                <li>
                  <Link href="/" className="hover:text-zinc-900">
                    ホーム
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/articles" className="hover:text-zinc-900">
                    記事一覧
                  </Link>
                </li>
                <li>/</li>
                <li className="text-zinc-400 truncate max-w-xs" title={title}>
                  {title}
                </li>
              </ol>
            </nav>

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
              <h1 className="font-mono text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                {title}
              </h1>
              <div className="flex items-center text-zinc-600 text-sm">
                <time>{date}</time>
              </div>
            </div>

            <div className="prose prose-zinc max-w-none">
              <div className="mt-8">
                {post.content && post.content.length > 0 ? (
                  // @ts-expect-error 一時的に型チェックを無効化してテスト
                  <NotionBlocks blocks={post.content} />
                ) : (
                  <p>コンテンツがありません</p>
                )}
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
                <h2 className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-zinc-900 mb-6">
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
                        className="block bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow h-32 sm:h-36 flex flex-col justify-between"
                      >
                        <h3 className="font-bold text-zinc-900 mb-2 line-clamp-2 text-sm sm:text-base leading-tight">
                          {relatedTitle}
                        </h3>
                        <time className="text-xs sm:text-sm text-zinc-500 mt-auto">
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
    </>
  );
} 