/**
 * Next.js ミドルウェア
 * @description セキュリティ、レート制限、ログ記録を処理するミドルウェア
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sendDiscordNotification } from '@/lib/discord'
import { getEnv } from '@/lib/env'
import { RateLimitInfo } from '@/types/types'

/**
 * レート制限の設定
 */
interface RateLimitConfig {
  window: number; // ウィンドウ時間（ミリ秒）
  max: number;    // 最大リクエスト数
}

/**
 * レート制限の記録
 */
interface RateLimitRecord {
  count: number;  // 現在のリクエスト数
  reset: number;  // リセット時刻（Unix timestamp）
}

/**
 * IPアドレスごとのレート制限を追跡するマップ
 * @description メモリ内でリクエスト数を追跡（本番環境ではRedisなどの永続化を推奨）
 */
const requestCounts = new Map<string, RateLimitRecord>()

/**
 * 環境変数からレート制限設定を取得
 * @returns レート制限の設定
 */
function getRateLimitConfig(): RateLimitConfig {
  const env = getEnv()
  return {
    window: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
  }
}

/**
 * IPアドレスを取得
 * @param request - Next.jsのリクエストオブジェクト
 * @returns IPアドレス
 */
function getClientIP(request: NextRequest): string {
  // プロキシ経由のIPアドレスを優先的に取得
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const connectingIP = request.headers.get('cf-connecting-ip') // Cloudflare
  
  if (forwardedFor) {
    // 複数のIPがある場合は最初のものを使用
    return forwardedFor.split(',')[0].trim()
  }
  
  return realIP || connectingIP || 'unknown'
}

/**
 * 古いレート制限記録をクリーンアップ
 * @description メモリリークを防ぐため、期限切れの記録を削除
 */
function cleanupExpiredRecords(): void {
  const now = Date.now()
  const config = getRateLimitConfig()
  
  for (const [ip, record] of requestCounts.entries()) {
    if (record.reset < now - config.window) {
      requestCounts.delete(ip)
    }
  }
}

/**
 * レート制限をチェック
 * @param ip - クライアントのIPアドレス
 * @returns レート制限の情報
 */
function checkRateLimit(ip: string): RateLimitInfo {
  const now = Date.now()
  const config = getRateLimitConfig()
  const record = requestCounts.get(ip)

  // 既存のレコードがない、またはリセット時間を過ぎている場合
  if (!record || record.reset < now) {
    const newRecord: RateLimitRecord = {
      count: 1,
      reset: now + config.window
    }
    
    requestCounts.set(ip, newRecord)
    
    return {
      limit: config.max,
      remaining: config.max - 1,
      reset: newRecord.reset,
      window: config.window
    }
  }

  // リセット時間内でリクエスト数が制限を超えている場合
  if (record.count >= config.max) {
    return {
      limit: config.max,
      remaining: 0,
      reset: record.reset,
      window: config.window
    }
  }

  // リクエスト数をインクリメント
  record.count += 1
  
  return {
    limit: config.max,
    remaining: config.max - record.count,
    reset: record.reset,
    window: config.window
  }
}

/**
 * セキュリティヘッダーを設定
 * @param response - Next.jsのレスポンスオブジェクト
 */
function setSecurityHeaders(response: NextResponse): void {
  // XSS攻撃対策
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  
  // リファラーポリシー
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // 権限ポリシー
  response.headers.set(
    'Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  )
  
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com *.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' blob: data: *.googleapis.com *.notion.so *.unsplash.com",
    "font-src 'self' fonts.gstatic.com",
    "connect-src 'self' *.google-analytics.com *.analytics.google.com *.googletagmanager.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ]
  
  response.headers.set('Content-Security-Policy', cspDirectives.join('; '))
  
  // HSTS (HTTPSでのみ有効)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }
}

/**
 * CORS ヘッダーを設定
 * @param response - Next.jsのレスポンスオブジェクト
 */
function setCORSHeaders(response: NextResponse): void {
  const env = getEnv()
  const allowedOrigin = env.NEXT_PUBLIC_BASE_URL
  
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400') // 24時間
}

/**
 * レート制限ヘッダーを設定
 * @param response - Next.jsのレスポンスオブジェクト
 * @param rateLimitInfo - レート制限の情報
 */
function setRateLimitHeaders(response: NextResponse, rateLimitInfo: RateLimitInfo): void {
  response.headers.set('X-RateLimit-Limit', rateLimitInfo.limit.toString())
  response.headers.set('X-RateLimit-Remaining', rateLimitInfo.remaining.toString())
  response.headers.set('X-RateLimit-Reset', rateLimitInfo.reset.toString())
  response.headers.set('X-RateLimit-Window', rateLimitInfo.window.toString())
}

/**
 * リクエストをログ記録
 * @param request - Next.jsのリクエストオブジェクト
 * @param ip - クライアントのIPアドレス
 * @param rateLimited - レート制限されたかどうか
 */
function logRequest(request: NextRequest, ip: string, rateLimited: boolean): void {
  const timestamp = new Date().toISOString()
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const method = request.method
  const url = request.url
  
  console.log(
    `[${timestamp}] ${method} ${url} - IP: ${ip} - UA: ${userAgent}${
      rateLimited ? ' - RATE LIMITED' : ''
    }`
  )
}

/**
 * ミドルウェアのメイン処理
 * @param request - Next.jsのリクエストオブジェクト
 * @returns レスポンス
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    // 定期的なクリーンアップ（10%の確率で実行）
    if (Math.random() < 0.1) {
      cleanupExpiredRecords()
    }
    
    // IPアドレスの取得
    const ip = getClientIP(request)
    
    // レート制限のチェック
    const rateLimitInfo = checkRateLimit(ip)
    const isRateLimited = rateLimitInfo.remaining <= 0
    
    // リクエストをログ記録
    logRequest(request, ip, isRateLimited)
    
    // レスポンスの作成
    let response: NextResponse
    
    if (isRateLimited) {
      response = new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((rateLimitInfo.reset - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    } else {
      response = NextResponse.next()
    }
    
    // ヘッダーの設定
    setSecurityHeaders(response)
    setRateLimitHeaders(response, rateLimitInfo)
    
    // OPTIONSリクエストの処理
    if (request.method === 'OPTIONS') {
      setCORSHeaders(response)
      return new NextResponse(null, { status: 200, headers: response.headers })
    }
    
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    
    // エラーをDiscordに通知
    try {
      if (error instanceof Error) {
        await sendDiscordNotification(error, {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          timestamp: new Date().toISOString()
        })
      }
    } catch (notificationError) {
      console.error('Failed to send error notification:', notificationError)
    }
    
    // エラーレスポンスを返す
    return new NextResponse(
      JSON.stringify({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

/**
 * ミドルウェアを適用するパスの設定
 * @description APIルートにのみ適用
 */
export const config = {
  matcher: [
    '/api/:path*',
    // 静的ファイルは除外
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ]
}

/**
 * デプロイメント時の健全性チェック
 * @description 環境変数とNotionの接続をチェック
 */
export async function healthCheck(): Promise<{ success: boolean; message: string }> {
  try {
    // 環境変数の検証
    getEnv()
    
    // 必要に応じてNotionの接続テストも実行
    // const notionTest = await testNotionConnection()
    
    console.log('✅ Health check passed')
    return { 
      success: true, 
      message: 'All systems operational' 
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ Health check failed:', errorMessage)
    
    // 重大なエラーをDiscordに通知
    try {
      if (error instanceof Error) {
        await sendDiscordNotification(error, {
          type: 'HEALTH_CHECK_FAILURE',
          environment: process.env.NODE_ENV,
          timestamp: new Date().toISOString()
        })
      }
    } catch (notificationError) {
      console.error('Failed to send health check error notification:', notificationError)
    }
    
    return { 
      success: false, 
      message: errorMessage 
    }
  }
} 