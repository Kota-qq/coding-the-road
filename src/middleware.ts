import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// インメモリストア（本番環境では Redis などを使用することを推奨）
const rateLimit = new Map()

// レート制限の設定
const RATE_LIMIT_WINDOW = 60 * 1000 // 1分
const MAX_REQUESTS = 100 // リクエスト数の制限

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security Headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: *.googleapis.com *.notion.so;
      font-src 'self';
      connect-src 'self' *.google-analytics.com;
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  )

  // レート制限の実装
  const ip = request.ip || 'unknown'
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW

  // 古いエントリーの削除
  const userRequests = rateLimit.get(ip) || []
  const recentRequests = userRequests.filter(time => time > windowStart)

  if (recentRequests.length >= MAX_REQUESTS) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  // 新しいリクエストを追加
  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)

  if (request.method === 'OPTIONS') {
    response.headers.set('Access-Control-Allow-Methods', 'GET')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.set('Access-Control-Allow-Origin', 'https://codingtheroad.com')
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * APIルートのみにレート制限を適用する場合は以下のようにマッチャーを設定
     * '/api/:path*'
     */
    '/:path*'
  ]
}

export async function checkDeployment() {
  // 環境変数の確認
  const requiredEnvVars = [
    'NOTION_API_KEY',
    'NOTION_DATABASE_ID',
    'LINE_NOTIFY_TOKEN'
  ]

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      console.error(`Missing environment variable: ${envVar}`)
    }
  })

  // Notionとの接続確認
  try {
    const posts = await getPosts()
    console.log('Notion connection successful')
  } catch (error) {
    console.error('Notion connection failed:', error)
  }
}

export async function monitorDeployment() {
  try {
    // デプロイ完了通知
    await sendLineNotification(
      '🚀 デプロイが完了しました',
      'info',
      {
        environment: process.env.VERCEL_ENV,
        deploymentUrl: process.env.VERCEL_URL,
        timestamp: new Date().toISOString()
      }
    )
  } catch (error) {
    console.error('Monitoring setup failed:', error)
  }
} 