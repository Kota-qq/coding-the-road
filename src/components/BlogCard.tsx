/**
 * ブログカードコンポーネント
 * @description ブログ記事を表示するカードコンポーネント
 */

import Link from 'next/link';
import { BlogPost } from '@/types/types';
import { getPostTitle, getPostDescription, formatPostDate } from '@/lib/notion';

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
  const title = getPostTitle(post);
  const description = getPostDescription(post);
  const formattedDate = formatPostDate(post);
  
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
      className={`${baseClasses} ${compactClasses} ${className}`}
      role="article"
      aria-labelledby={`post-title-${post.id}`}
    >
      <Link 
        href={`/posts/${post.id}`} 
        className="block group focus:outline-none"
        aria-describedby={description ? `post-desc-${post.id}` : undefined}
      >
        {/* タイトル */}
        <h3 
          id={`post-title-${post.id}`}
          className={`
            font-bold text-zinc-900 mb-3 line-clamp-2 
            group-hover:text-zinc-700 transition-colors duration-200
            ${variant === 'compact' ? 'text-lg' : 'text-xl'}
          `.trim()}
        >
          {title}
        </h3>

        {/* 説明文（compactモードでは非表示） */}
        {description && variant !== 'compact' && (
          <p 
            id={`post-desc-${post.id}`}
            className="text-zinc-600 text-sm mb-4 line-clamp-3 leading-relaxed"
          >
            {description}
          </p>
        )}

        {/* 投稿日 */}
        <div className="flex items-center justify-between">
          <time 
            className="font-mono text-sm text-zinc-500 group-hover:text-zinc-600 transition-colors duration-200"
            dateTime={post.properties.Date.date?.start}
            title={`投稿日: ${formattedDate}`}
          >
            {formattedDate}
          </time>
          
          {/* 読む時間の表示（将来的な拡張用） */}
          {/* <span className="text-xs text-zinc-400">
            約 {readingTime} 分で読めます
          </span> */}
        </div>

        {/* ホバーエフェクト用のインジケーター */}
        <div className="mt-4 flex items-center text-zinc-400 group-hover:text-zinc-600 transition-colors duration-200">
          <span className="text-sm font-medium">記事を読む</span>
          <svg 
            className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
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