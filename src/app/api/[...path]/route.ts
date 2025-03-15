import { headers } from 'next/headers'

export async function GET() {
  // API Rate Limiting
  const headersList = headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  
  const rateLimitResult = await checkRateLimit(ip)
  if (!rateLimitResult.success) {
    return new Response('Too Many Requests', { status: 429 })
  }

  // その他のAPI処理
  return new Response('OK');
} 