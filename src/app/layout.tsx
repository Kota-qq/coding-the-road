import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://codingtheroad.com'),
  title: {
    default: 'Coding the Road',
    template: '%s | Coding the Road'
  },
  description: 'エンジン音とキーボードのリズムが響き合う。車とバイク好きなエンジニアの技術記録。',
  keywords: [
    'プログラミング', 
    'エンジニア', 
    '車', 
    'バイク', 
    'テクノロジー', 
    'Web開発',
    'Laravel',
    'Next.js',
    'TypeScript',
    'PHP'
  ],
  authors: [{ 
    name: 'Kota',
    url: 'https://twitter.com/kota_qq'
  }],
  creator: 'Kota',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://codingtheroad.com',
    siteName: 'Coding the Road',
    title: 'Coding the Road',
    description: 'エンジン音とキーボードのリズムが響き合う。車とバイク好きなエンジニアの技術記録。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Coding the Road by Kota'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coding the Road',
    description: 'エンジン音とキーボードのリズムが響き合う。車とバイク好きなエンジニアの技術記録。',
    creator: '@kota_qq',
    images: ['/og-image.png']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'あなたのGoogle Search Console確認コード',
  },
  alternates: {
    canonical: 'https://codingtheroad.com'
  }
}

export const viewport = {
  themeColor: '#18181b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 ${inter.className}`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
