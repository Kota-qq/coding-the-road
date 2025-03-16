import { Github, Twitter } from 'lucide-react';
import Image from 'next/image';
import { FaPhp, FaLaravel } from 'react-icons/fa';
import { DiPostgresql } from 'react-icons/di';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: '27歳。国家公務員からエンジニアに転職し1年目。技術の可能性に魅了され、キャリアチェンジを決意した。自社開発企業に勤めながら日々コードに触れ、休日は愛車のランエボXとLANZAと戯れる。',
  openGraph: {
    title: 'About | Coding the Road',
    description: '27歳。国家公務員からエンジニアに転職し1年目。技術の可能性に魅了され、キャリアチェンジを決意した。自社開発企業に勤めながら日々コードに触れ、休日は愛車のランエボXとLANZAと戯れる。',
    images: [
      {
        url: '/about-og.png', // Aboutページ用のOGP画像があれば
        width: 1200,
        height: 630,
        alt: 'About Kota | Coding the Road'
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
            <div className="relative w-40 h-40 rounded-full overflow-hidden bg-zinc-200">
              <Image
                src="/profile.png"
                alt="Profile"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                priority
              />
            </div>
            
            {/* プロフィール情報 */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="font-mono text-4xl font-bold text-zinc-900 mb-4">
                Kota
              </h1>
              <p className="text-zinc-600 mb-6">
                Backend Engineer
              </p>
              
              {/* SNSリンク */}
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <a
                  href="https://github.com/Kota-qq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <Github className="w-6 h-6" />
                </a>
                <a
                  href="https://twitter.com/kota_qq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <Twitter className="w-6 h-6" />
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
              27歳。国家公務員からエンジニアに転職し1年目。<br />
              技術の可能性に魅了され、キャリアチェンジを決意した。<br />
              自社開発企業に勤めながら日々コードに触れ、休日は愛車のランエボXとLANZAと戯れる。<br />
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