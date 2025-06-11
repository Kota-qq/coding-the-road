import { Github } from 'lucide-react';
import Image from 'next/image';
import { FaPhp, FaLaravel, FaJs, FaReact } from 'react-icons/fa';
import { DiPostgresql } from 'react-icons/di';
import type { Metadata } from 'next'

/**
 * Twitter X Logo Component
 * @description 正しいTwitter Xのロゴを表示するSVGコンポーネント
 */
function TwitterXIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-label="Twitter X"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export const metadata: Metadata = {
  title: 'About',
  description: '28歳。国家公務員からエンジニアに転職し2年目。技術の可能性に魅了され、キャリアチェンジを決意した。自社開発企業に勤めながら日々コードに触れ、休日は愛車と戯れる。',
  openGraph: {
    title: 'About | Coding the Road',
    description: '28歳。国家公務員からエンジニアに転職し2年目。技術の可能性に魅了され、キャリアチェンジを決意した。自社開発企業に勤めながら日々コードに触れ、休日は愛車と戯れる。',
    images: [
      {
        url: '/about-og.png', // Aboutページ用のOGP画像があれば
        width: 1200,
        height: 630,
        alt: 'About Takibi | Coding the Road'
      }
    ]
  },
  alternates: {
    canonical: 'https://codingtheroad.com/about'
  }
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100">
      <div className="pt-32 pb-20 container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* プロフィールヘッダー */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
            {/* プロフィール画像 */}
            <div className="relative w-40 h-40 rounded-full overflow-hidden bg-zinc-200 shadow-lg">
              <Image
                src="/profile.webp"
                alt="Takibiのプロフィール写真"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                priority
                quality={85}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R7XTvY9VyPNZPqz/9k="
                sizes="(max-width: 768px) 160px, 160px"
              />
              {/* Loading spinner */}
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 opacity-0 animate-pulse">
                <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
              </div>
            </div>
            
            {/* プロフィール情報 */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-mono text-4xl font-bold text-zinc-900 mb-4">
                Takibi
              </h1>
              <p className="text-zinc-600 mb-6">
                Engineer
              </p>
              
              {/* SNSリンク */}
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <a
                  href="https://github.com/Kota-qq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100"
                  aria-label="GitHubプロフィールを開く"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="https://twitter.com/takibi_code"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors rounded-lg hover:bg-zinc-100"
                  aria-label="Twitter/X プロフィールを開く"
                >
                  <TwitterXIcon className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          {/* About Me セクション */}
          <section className="mb-16">
            <h2 className="font-mono text-2xl font-bold text-zinc-900 mb-6 relative inline-block">
              About Me
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-zinc-900 to-zinc-500"></span>
            </h2>
            <p className="text-zinc-600 leading-relaxed">
              28歳。国家公務員からエンジニアに転職し2年目。<br />
              技術の可能性に魅了され、キャリアチェンジを決意した。<br />
              自社開発企業に勤めながら日々コードに触れ、休日は愛車と戯れる。<br />
              ご質問等ありましたらお気軽にXまでご連絡ください。
            </p>
          </section>

          {/* Skills セクション */}
          <section className="mb-16">
            <h2 className="font-mono text-2xl font-bold text-zinc-900 mb-6 relative inline-block">
              Skills
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-zinc-900 to-zinc-500"></span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                <FaPhp className="w-5 h-5 text-indigo-600" />
                <p className="font-mono text-zinc-800">PHP</p>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                <FaLaravel className="w-5 h-5 text-red-600" />
                <p className="font-mono text-zinc-800">Laravel</p>
              </div>
                <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                  <FaJs className="w-5 h-5 text-red-600" />
                  <p className="font-mono text-zinc-800">JavaScript</p>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                  <FaReact className="w-5 h-5 text-red-600" />
                  <p className="font-mono text-zinc-800">React</p>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                <DiPostgresql className="w-5 h-5 text-blue-600" />
                <p className="font-mono text-zinc-800">PostgreSQL</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 