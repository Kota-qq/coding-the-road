/**
 * ブログカードコンポーネント
 * @description ブログ記事を表示するカードコンポーネント
 */

import Link from 'next/link';
import { BlogPost } from '@/types/types';

/**
 * BlogCardのProps
 */
interface BlogCardProps {
  /** ブログ記事のデータ */
  post: BlogPost;
  /** カードのバリアント（デフォルト、コンパクト） */
  variant?: 'default' | 'compact';
  /** 追加のクラス名 */
  className?: string;
}

/**
 * ブログカードコンポーネント
 * @param props - BlogCardのprops
 * @returns ブログカードコンポーネント
 */
export default function BlogCard({ 
  post, 
  variant = 'default',
  className = '' 
}: BlogCardProps) {
  const title = post.properties.Title?.title?.[0]?.plain_text || 'No Title';
  const description = post.properties.Description?.rich_text?.[0]?.plain_text || '';
  const date = post.properties.Date?.date?.start 
    ? new Date(post.properties.Date.date.start).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '日付なし';

  // 記事が無効な場合の防御的プログラミング
  if (!post?.id) {
    console.warn('BlogCard: Invalid post data provided');
    return null;
  }

  const baseClasses = `
    bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100
    hover:shadow-lg hover:border-zinc-200 
    transition-all duration-300 transform hover:-translate-y-1
    focus-within:ring-2 focus-within:ring-zinc-400 focus-within:ring-opacity-50
  `.trim();

  const compactClasses = variant === 'compact' 
    ? 'p-4' 
    : 'p-6';

  return (
    <article 
      className={`${baseClasses} ${compactClasses} ${className} h-fit min-h-[200px] flex flex-col`}
      role="article"
      aria-labelledby={`post-title-${post.id}`}
    >
      <Link 
        href={`/posts/${post.id}`} 
        className="block group focus:outline-none h-full flex flex-col"
        aria-describedby={description ? `post-desc-${post.id}` : undefined}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <time 
              dateTime={post.properties.Date?.date?.start}
              className="text-sm text-zinc-500"
            >
              {date}
            </time>
          </div>
          
          <header>
            <h2 className="text-xl font-semibold mb-3 text-zinc-900 line-clamp-2 leading-relaxed">
              {title}
            </h2>
          </header>
          
          {description && (
            <p className="text-zinc-600 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
          
          <footer className="mt-4 pt-4 border-t border-zinc-100">
            <span className="text-blue-600 hover:text-blue-800 font-medium transition-colors inline-flex items-center">
              続きを読む
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </footer>
        </div>
      </Link>
    </article>
  );
}

/**
 * ブログカードのスケルトンローダー
 * @description データ読み込み中に表示するスケルトン
 */
export function BlogCardSkeleton({ 
  variant = 'default', 
  className = '' 
}: Pick<BlogCardProps, 'variant' | 'className'>) {
  const compactClasses = variant === 'compact' ? 'p-4' : 'p-6';
  
  return (
    <div 
      className={`
        bg-white rounded-2xl overflow-hidden shadow-sm border border-zinc-100
        ${compactClasses} ${className} animate-pulse
      `.trim()}
      role="status"
      aria-label="記事を読み込み中..."
    >
      {/* タイトルスケルトン */}
      <div className={`
        bg-zinc-200 rounded mb-3
        ${variant === 'compact' ? 'h-5' : 'h-6'}
      `} />
      <div className={`
        bg-zinc-200 rounded mb-4 w-3/4
        ${variant === 'compact' ? 'h-5' : 'h-6'}
      `} />
      
      {/* 説明文スケルトン（compactモードでは非表示） */}
      {variant !== 'compact' && (
        <>
          <div className="bg-zinc-200 rounded h-4 mb-2" />
          <div className="bg-zinc-200 rounded h-4 mb-2 w-5/6" />
          <div className="bg-zinc-200 rounded h-4 mb-4 w-2/3" />
        </>
      )}
      
      {/* 日付スケルトン */}
      <div className="bg-zinc-200 rounded h-4 w-24" />
    </div>
  );
} 