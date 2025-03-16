import { headers } from 'next/headers'

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  reset?: number;
}

// メモリ内でリクエスト数を追跡
const requestCounts = new Map<string, { count: number; reset: number }>();

async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const MAX_REQUESTS = 100;
  const TIME_WINDOW = 60 * 60 * 1000; // 1時間

  const now = Date.now();
  const record = requestCounts.get(ip);

  // 既存のレコードがない、またはリセット時間を過ぎている場合
  if (!record || record.reset < now) {
    requestCounts.set(ip, {
      count: 1,
      reset: now + TIME_WINDOW
    });
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      reset: now + TIME_WINDOW
    };
  }

  // リセット時間内でリクエスト数が制限を超えている場合
  if (record.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      reset: record.reset
    };
  }

  // リクエスト数をインクリメント
  record.count += 1;
  return {
    success: true,
    remaining: MAX_REQUESTS - record.count,
    reset: record.reset
  };
}

export async function GET() {
  // API Rate Limiting
  const headersList = headers()
  const ip = (await headersList).get('x-forwarded-for') || 'unknown'
  
  const rateLimitResult = await checkRateLimit(ip)
  if (!rateLimitResult.success) {
    return new Response('Too Many Requests', { 
      status: 429,
      headers: {
        'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '0',
        'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '0'
      }
    })
  }

  // その他のAPI処理
  return new Response('OK', {
    headers: {
      'X-RateLimit-Remaining': rateLimitResult.remaining?.toString() || '100',
      'X-RateLimit-Reset': rateLimitResult.reset?.toString() || '0'
    }
  })
} 