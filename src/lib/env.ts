/**
 * 環境変数の管理と検証
 * @description アプリケーションで使用する環境変数の型安全な管理
 */

import { z } from 'zod';

/**
 * 環境変数のスキーマ定義
 */
const envSchema = z.object({
  // Notion関連
  NOTION_API_KEY: z.string().min(1, 'NOTION_API_KEY is required'),
  NOTION_DATABASE_ID: z.string().min(1, 'NOTION_DATABASE_ID is required'),
  
  // Discord関連（オプショナル）
  DISCORD_WEBHOOK_URL: z.string().url().optional(),
  
  // アプリケーション設定
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_BASE_URL: z.string().url().default('http://localhost:3000'),
  
  // セキュリティ設定
  RATE_LIMIT_MAX: z.coerce.number().min(1).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().min(1000).default(60000),
});

/**
 * 環境変数の型定義
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * 検証済み環境変数のキャッシュ
 */
let validatedEnv: EnvConfig | null = null;

/**
 * 環境変数を検証し、型安全なオブジェクトを返す
 * @returns 検証済み環境変数
 * @throws エラー - 必須の環境変数が不足している場合
 */
export function getEnv(): EnvConfig {
  // キャッシュがある場合は再利用
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map(err => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      
      throw new Error(
        `Environment validation failed:\n${missingVars}\n\n` +
        'Please check your environment variables in .env.local'
      );
    }
    throw error;
  }
}

/**
 * 環境変数の検証（起動時チェック用）
 * @description アプリケーション起動時に環境変数を検証
 */
export function validateEnv(): void {
  try {
    getEnv();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    
    // Edge Runtimeではprocess.exitは使用できないため、エラーを再スローして
    // アプリケーション側でハンドリングしてもらう
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}

/**
 * 開発環境かどうかを判定
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * 本番環境かどうかを判定
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * テスト環境かどうかを判定
 */
export function isTest(): boolean {
  return getEnv().NODE_ENV === 'test';
}

/**
 * 環境変数の一覧を表示（デバッグ用）
 * @description 本番環境では機密情報を隠す
 */
export function debugEnv(): void {
  if (!isDevelopment()) {
    console.log('Environment debugging is only available in development mode');
    return;
  }

  const env = getEnv();
  const maskedEnv = {
    ...env,
    NOTION_API_KEY: env.NOTION_API_KEY.slice(0, 10) + '...',
    DISCORD_WEBHOOK_URL: env.DISCORD_WEBHOOK_URL ? '***' : undefined,
  };
  
  console.log('🔍 Environment Variables:', maskedEnv);
} 