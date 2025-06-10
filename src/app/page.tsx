/**
 * ホームページコンポーネント
 * @description ブログのメインページ - ヒーローセクションと最新記事を表示
 */

import RotatingTitle from '@/components/RotatingTitle';
import ExploreButton from '@/components/ExploreButton';
import BlogCard, { BlogCardSkeleton } from '@/components/BlogCard';
import { getLatestPosts } from '@/lib/notion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Suspense } from 'react';
import { Metadata } from 'next';

// キャッシュの再検証間隔（5分 = 300秒）
export const revalidate = 300;

/**
 * ページのメタデータ
 */
export const metadata: Metadata = {
  title: 'ホーム',
  description: 'エンジン音とキーボードのリズムが響き合う。車とバイク好きなエンジニアの技術記録。',
  openGraph: {
    title: 'Coding the Road',
    description: 'エンジン音とキーボードのリズムが響き合う。車とバイク好きなエンジニアの技術記録。',
    type: 'website',
  },
};

/**
 * 最新記事セクションコンポーネント
 * @description 最新記事を表示するセクション
 */
async function LatestArticlesSection() {
  try {
    const latestPosts = await getLatestPosts(4);

    if (!latestPosts || latestPosts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-zinc-500 text-lg">
            まだ記事が投稿されていません。
          </p>
          <p className="text-zinc-400 text-sm mt-2">
            近日中に素晴らしいコンテンツをお届けします！
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {latestPosts.map((post) => (
            <BlogCard 
              key={post.id} 
              post={post}
              className="hover:shadow-xl transition-shadow duration-300" 
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/articles"
            className="group relative inline-flex items-center justify-center px-8 py-4 
                     font-mono text-sm tracking-wider rounded-full overflow-hidden
                     transition-all duration-300 border-2 border-transparent
                     hover:border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-opacity-50"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-zinc-800 opacity-0 
                           group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative flex items-center gap-2 text-zinc-900 group-hover:text-white 
                           transition-colors duration-300">
              <span className="relative">
                VIEW ALL ARTICLES
              </span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Link>
        </div>
      </>
    );
  } catch (error) {
    console.error('Failed to load latest articles:', error);
    
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-800 font-medium mb-2">
            記事の読み込みに失敗しました
          </p>
          <p className="text-red-600 text-sm mb-4">
            しばらく時間をおいてから再度お試しください。
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
          >
            ページを再読み込み
          </button>
        </div>
      </div>
    );
  }
}

/**
 * 最新記事のスケルトンローダー
 * @description データ読み込み中に表示するスケルトン
 */
function LatestArticlesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Array.from({ length: 4 }, (_, index) => (
        <BlogCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
}

/**
 * ヒーローセクションコンポーネント
 * @description ページ上部のメインビジュアルセクション
 */
function HeroSection() {
  return (
    <section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      role="banner"
      aria-label="メインビジュアル"
    >
      <div className="z-10 w-full max-w-5xl mx-auto px-6">
        <RotatingTitle />
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <ExploreButton />
        </div>
      </div>
      
      {/* 背景グラデーション */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800"
        aria-hidden="true"
      ></div>
      
      {/* パフォーマンス向上のための背景画像プリロード（将来的な拡張用） */}
      {/* <div className="absolute inset-0 bg-cover bg-center opacity-20" 
           style={{ backgroundImage: 'url(/hero-bg.jpg)' }}></div> */}
    </section>
  );
}

/**
 * メインページコンポーネント
 * @returns ホームページのJSX
 */
export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      <HeroSection />

      {/* メインコンテンツ */}
      <main className="container mx-auto px-6 py-20">
        {/* 最新記事セクション */}
        <section 
          id="latest-articles" 
          className="py-20"
          aria-labelledby="latest-articles-heading"
        >
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              {/* セクションヘッダー */}
              <div className="mb-12 text-center">
                <h2 
                  id="latest-articles-heading"
                  className="font-mono text-2xl font-bold text-zinc-900 mb-4 relative inline-block"
                >
                  LATEST ARTICLES
                  <span 
                    className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-zinc-900 to-zinc-500"
                    aria-hidden="true"
                  ></span>
                </h2>
                <p className="text-zinc-600 mt-4 max-w-2xl mx-auto">
                  プログラミング、車、バイクについての最新の記事をお届けします。
                  技術的な発見から趣味の話まで、幅広いトピックを扱っています。
                </p>
              </div>

              {/* 最新記事のリスト */}
              <Suspense fallback={<LatestArticlesSkeleton />}>
                <LatestArticlesSection />
              </Suspense>
            </div>
          </div>
        </section>

        {/* 追加セクション（将来的な拡張用） */}
        {/* <section className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-zinc-900 mb-6">About This Blog</h2>
            <p className="text-zinc-600 leading-relaxed">
              このブログでは、Web開発、モバイルアプリ開発、そして車やバイクについての
              情報を発信しています。技術的な記事から趣味の話まで、
              様々なコンテンツをお楽しみいただけます。
            </p>
          </div>
        </section> */}
      </main>
    </div>
  );
}
