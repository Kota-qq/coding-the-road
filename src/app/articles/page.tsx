import { getPosts } from '@/lib/notion';
import BlogCard from '@/components/BlogCard';
import Link from 'next/link';
import type { Metadata } from 'next'

const POSTS_PER_PAGE = 10;

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

// ページキャッシュ設定
export const revalidate = 1800; // 30分キャッシュ
export const fetchCache = 'force-cache';



export default async function ArticlesPage(props: Props) {
  const { searchParams } = props;
  const params = await searchParams;  // searchParamsをawaitで待つ
  const allPosts = await getPosts();

  // 文字列を数値に変換（デフォルト: 1）
  const page = params?.page ? parseInt(params.page) : 1;
  
  // 日付でソート
  const sortedPosts = allPosts.sort((a, b) => {
    const dateA = a.properties.Date?.date?.start || '';
    const dateB = b.properties.Date?.date?.start || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  // ページング用のスライス
  const totalPages = Math.ceil(sortedPosts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const paginatedPosts = sortedPosts.slice(start, start + POSTS_PER_PAGE);

  // 構造化データ（JSON-LD）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Coding the Road - 技術記事一覧",
    "description": "プログラミング、Web開発、車・バイクに関する技術記事をお届けします。",
    "url": "https://codingtheroad.com/articles",
    "inLanguage": "ja-JP",
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
    "blogPost": paginatedPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.properties.Title?.title?.[0]?.plain_text || 'No Title',
      "description": post.properties.Description?.rich_text?.[0]?.plain_text || '',
      "url": `https://codingtheroad.com/posts/${post.id}`,
      "datePublished": post.properties.Date?.date?.start || new Date().toISOString(),
      "dateModified": post.last_edited_time || post.properties.Date?.date?.start || new Date().toISOString(),
      "author": {
        "@type": "Person",
        "name": "Kota"
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
        <div className="pt-32 pb-20 container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h1 className="font-mono text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 mb-4">
                ARTICLES
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-zinc-900 to-zinc-500"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paginatedPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-4">
                {page > 1 && (
                  <Link
                    href={`/articles?page=${page - 1}`}
                    className="px-4 py-2 font-mono text-sm text-zinc-600 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 font-mono text-sm text-zinc-900">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/articles?page=${page + 1}`}
                    className="px-4 py-2 font-mono text-sm text-zinc-600 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}

            {paginatedPosts.length === 0 && (
              <div className="text-center text-zinc-500 py-20">
                No articles found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export const metadata: Metadata = {
  title: 'Articles',
  description: '技術記事の一覧。プログラミング、Web開発、車、バイクに関する記事を掲載しています。',
  openGraph: {
    title: 'Articles | Coding the Road',
    description: '技術記事の一覧。プログラミング、Web開発、車、バイクに関する記事を掲載しています。',
  }
} 