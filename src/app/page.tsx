import RotatingTitle from '@/components/RotatingTitle';
import ExploreButton from '@/components/ExploreButton';
import BlogCard from '@/components/BlogCard';
import { getPosts } from '@/lib/notion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// 5分ごとにキャッシュを更新
export const revalidate = 300;

export default async function Home() {
  const allPosts = await getPosts();
  const latestPosts = allPosts
    .sort((a, b) => {
      const dateA = a.properties.Date?.date?.start || '';
      const dateB = b.properties.Date?.date?.start || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      {/* ヒーローセクション */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="z-10 w-full max-w-5xl mx-auto px-6">
          <RotatingTitle />
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
            <ExploreButton />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800"></div>
      </section>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-6 py-20">
        {/* 最新記事セクション */}
        <section id="latest-articles" className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h2 className="font-mono text-2xl font-bold text-zinc-900 mb-4 relative inline-block">
                  LATEST ARTICLES
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-zinc-900 to-zinc-500"></span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {latestPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/articles"
                  className="group relative inline-flex items-center justify-center px-8 py-4 
                           font-mono text-sm tracking-wider rounded-full overflow-hidden
                           transition-all duration-300"
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
