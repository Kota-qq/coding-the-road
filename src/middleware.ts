import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendDiscordNotification } from '@/lib/discord'

// レート制限のための設定
const RATE_LIMIT = {
  window: 60 * 1000, // 1分
  max: 100 // リクエスト数
}

// メモリ内でリクエスト数を追跡
const requestCounts = new Map<string, { count: number; reset: number }>()

// レート制限をチェックする関数
function checkRateLimit(ip: string): { limited: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const record = requestCounts.get(ip)

  // 既存のレコードがない、またはリセット時間を過ぎている場合
  if (!record || record.reset < now) {
    requestCounts.set(ip, {
      count: 1,
      reset: now + RATE_LIMIT.window
    })
    return {
      limited: false,
      remaining: RATE_LIMIT.max - 1,
      reset: now + RATE_LIMIT.window
    }
  }

  // リセット時間内でリクエスト数が制限を超えている場合
  if (record.count >= RATE_LIMIT.max) {
    return {
      limited: true,
      remaining: 0,
      reset: record.reset
    }
  }

  // リクエスト数をインクリメント
  record.count += 1
  return {
    limited: false,
    remaining: RATE_LIMIT.max - record.count,
    reset: record.reset
  }
}

export async function middleware(request: NextRequest) {
  try {
    // IPアドレスの取得
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'

    // レート制限のチェック
    const { limited, remaining, reset } = checkRateLimit(ip)

    // レスポンスの作成
    const response = limited
      ? new NextResponse('Too Many Requests', { status: 429 })
      : NextResponse.next()

    // レート制限のヘッダーを設定
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT.max.toString())
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', reset.toString())

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

    if (request.method === 'OPTIONS') {
      response.headers.set('Access-Control-Allow-Methods', 'GET')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
      response.headers.set('Access-Control-Allow-Origin', 'https://codingtheroad.com')
      return response
    }

    return response
  } catch (error) {
    // エラーが発生した場合はDiscordに通知
    if (error instanceof Error) {
      await sendDiscordNotification(error, {
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries())
      });
    }
    throw error;
  }
}

// ミドルウェアを適用するパスを設定
export const config = {
  matcher: '/api/:path*'
}

export async function checkDeployment() {
  try {
    // 環境変数の確認
    const requiredEnvVars = [
      'NOTION_API_KEY',
      'NOTION_DATABASE_ID',
      'DISCORD_WEBHOOK_URL'
    ]

    const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])
    if (missingVars.length > 0) {
      throw new Error(`Missing environment variables: ${missingVars.join(', ')}`)
    }

    // Notionとの接続確認
    // const result = await someFunction();
    console.log('Notion connection successful')
  } catch (error) {
    // エラーが発生した場合はDiscordに通知
    if (error instanceof Error) {
      await sendDiscordNotification(error, {
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });
    }
    throw error;
  }
} 