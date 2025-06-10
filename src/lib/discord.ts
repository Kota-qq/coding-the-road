/**
 * Discord通知ライブラリ
 * @description エラーやイベントをDiscordに通知するためのユーティリティ
 */

import { getEnv, isDevelopment } from './env';

/**
 * Discordの色定数
 */
const DISCORD_COLORS = {
  ERROR: 0xFF0000,      // 赤
  WARNING: 0xFFA500,    // オレンジ
  INFO: 0x0099FF,       // 青
  SUCCESS: 0x00FF00,    // 緑
  DEBUG: 0x808080,      // グレー
} as const;

/**
 * 通知の重要度レベル
 */
export type NotificationLevel = 'error' | 'warning' | 'info' | 'success' | 'debug';

/**
 * Discordのembedフィールド
 */
interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

/**
 * Discordのembed
 */
interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: string;
  footer?: {
    text: string;
    icon_url?: string;
  };
  thumbnail?: {
    url: string;
  };
}

/**
 * Discordメッセージの構造
 */
interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

/**
 * 通知のコンテキスト情報
 */
export interface NotificationContext {
  /** リクエストURL */
  url?: string;
  /** HTTPメソッド */
  method?: string;
  /** リクエストヘッダー */
  headers?: Record<string, string>;
  /** ユーザーエージェント */
  userAgent?: string;
  /** IPアドレス */
  ip?: string;
  /** エラーが発生した関数名 */
  function?: string;
  /** 追加のメタデータ */
  metadata?: Record<string, unknown>;
  /** 環境情報 */
  environment?: string;
  /** タイムスタンプ */
  timestamp?: string;
  /** 通知タイプ */
  type?: string;
  /** ユーザーID（ある場合） */
  userId?: string;
}

/**
 * 送信結果
 */
interface SendResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * エラーの詳細情報を抽出
 * @param error - エラーオブジェクト
 * @returns エラーの詳細情報
 */
function extractErrorDetails(error: Error): {
  name: string;
  message: string;
  stack: string;
  cause?: string;
} {
  return {
    name: error.name || 'Unknown Error',
    message: error.message || 'No error message available',
    stack: error.stack?.slice(0, 1000) || 'No stack trace available',
    cause: error.cause ? String(error.cause) : undefined,
  };
}

/**
 * コンテキスト情報をフィールドに変換
 * @param context - 通知のコンテキスト
 * @returns Discordのembedフィールド配列
 */
function buildContextFields(context: NotificationContext): DiscordEmbedField[] {
  const fields: DiscordEmbedField[] = [];

  // 基本情報
  if (context.environment) {
    fields.push({
      name: '🌍 環境',
      value: context.environment,
      inline: true
    });
  }

  if (context.url) {
    fields.push({
      name: '🔗 URL',
      value: context.url.length > 100 ? `${context.url.slice(0, 100)}...` : context.url,
      inline: false
    });
  }

  if (context.method) {
    fields.push({
      name: '📡 メソッド',
      value: context.method,
      inline: true
    });
  }

  if (context.function) {
    fields.push({
      name: '⚙️ 関数',
      value: context.function,
      inline: true
    });
  }

  if (context.ip) {
    fields.push({
      name: '🌐 IP',
      value: context.ip,
      inline: true
    });
  }

  if (context.userAgent) {
    fields.push({
      name: '🖥️ User Agent',
      value: context.userAgent.length > 200 ? `${context.userAgent.slice(0, 200)}...` : context.userAgent,
      inline: false
    });
  }

  // メタデータ
  if (context.metadata && Object.keys(context.metadata).length > 0) {
    const metadataString = JSON.stringify(context.metadata, null, 2);
    fields.push({
      name: '📊 メタデータ',
      value: metadataString.length > 500 
        ? `${metadataString.slice(0, 500)}...` 
        : metadataString,
      inline: false
    });
  }

  return fields;
}

/**
 * 通知レベルに応じた色とアイコンを取得
 * @param level - 通知レベル
 * @returns 色とアイコン
 */
function getLevelConfig(level: NotificationLevel): { color: number; icon: string } {
  switch (level) {
    case 'error':
      return { color: DISCORD_COLORS.ERROR, icon: '🚨' };
    case 'warning':
      return { color: DISCORD_COLORS.WARNING, icon: '⚠️' };
    case 'info':
      return { color: DISCORD_COLORS.INFO, icon: 'ℹ️' };
    case 'success':
      return { color: DISCORD_COLORS.SUCCESS, icon: '✅' };
    case 'debug':
      return { color: DISCORD_COLORS.DEBUG, icon: '🔧' };
    default:
      return { color: DISCORD_COLORS.INFO, icon: 'ℹ️' };
  }
}

/**
 * Discordにメッセージを送信
 * @param message - 送信するメッセージ
 * @returns 送信結果
 */
async function sendToDiscord(message: DiscordMessage): Promise<SendResult> {
  try {
    const env = getEnv();
    
    if (!env.DISCORD_WEBHOOK_URL) {
      console.warn('Discord webhook URL is not configured');
      return { success: false, error: 'Webhook URL not configured' };
    }

    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TechBlog-Notifier/1.0'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${errorText}`,
        statusCode: response.status 
      };
    }

    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

/**
 * エラーをDiscordに通知
 * @param error - 通知するエラー
 * @param context - エラーのコンテキスト情報
 * @returns 送信結果
 */
export async function sendDiscordNotification(
  error: Error,
  context: NotificationContext = {}
): Promise<SendResult> {
  try {
    // 開発環境では詳細ログのみ出力
    if (isDevelopment()) {
      console.error('Discord notification (dev mode):', error.message, context);
      return { success: true }; // 開発環境では実際には送信しない
    }

    const errorDetails = extractErrorDetails(error);
    const { color, icon } = getLevelConfig('error');
    const timestamp = context.timestamp || new Date().toISOString();

    const embed: DiscordEmbed = {
      title: `${icon} エラーが発生しました`,
      description: `**${errorDetails.name}**\n${errorDetails.message}`,
      color,
      fields: [
        {
          name: '📅 発生時刻',
          value: new Date(timestamp).toLocaleString('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          inline: true
        },
        ...buildContextFields(context),
        {
          name: '📋 スタックトレース',
          value: `\`\`\`\n${errorDetails.stack}\`\`\``,
          inline: false
        }
      ],
      timestamp,
      footer: {
        text: 'Tech Blog Error Monitor',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png'
      }
    };

    const message: DiscordMessage = {
      username: 'Tech Blog Monitor',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
      embeds: [embed]
    };

    const result = await sendToDiscord(message);
    
    if (!result.success) {
      console.error('Failed to send Discord notification:', result.error);
    }

    return result;
  } catch (notificationError) {
    console.error('Error in sendDiscordNotification:', notificationError);
    return { 
      success: false, 
      error: notificationError instanceof Error ? notificationError.message : 'Unknown error' 
    };
  }
}

/**
 * カスタム通知をDiscordに送信
 * @param title - 通知のタイトル
 * @param message - 通知のメッセージ
 * @param level - 通知レベル
 * @param context - 追加のコンテキスト情報
 * @returns 送信結果
 */
export async function sendCustomNotification(
  title: string,
  message: string,
  level: NotificationLevel = 'info',
  context: NotificationContext = {}
): Promise<SendResult> {
  try {
    // 開発環境では詳細ログのみ出力
    if (isDevelopment()) {
      console.log(`Discord notification (dev mode) [${level}]:`, title, message, context);
      return { success: true };
    }

    const { color, icon } = getLevelConfig(level);
    const timestamp = context.timestamp || new Date().toISOString();

    const embed: DiscordEmbed = {
      title: `${icon} ${title}`,
      description: message,
      color,
      fields: buildContextFields(context),
      timestamp,
      footer: {
        text: 'Tech Blog Notification',
        icon_url: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png'
      }
    };

    const discordMessage: DiscordMessage = {
      username: 'Tech Blog Bot',
      avatar_url: 'https://cdn-icons-png.flaticon.com/512/2965/2965879.png',
      embeds: [embed]
    };

    return await sendToDiscord(discordMessage);
  } catch (error) {
    console.error('Error in sendCustomNotification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * デプロイ完了通知を送信
 * @param version - デプロイされたバージョン
 * @param context - デプロイのコンテキスト情報
 * @returns 送信結果
 */
export async function sendDeploymentNotification(
  version: string,
  context: NotificationContext = {}
): Promise<SendResult> {
  return sendCustomNotification(
    'デプロイ完了',
    `バージョン ${version} が正常にデプロイされました。`,
    'success',
    {
      ...context,
      type: 'DEPLOYMENT',
      metadata: {
        version,
        deployedAt: new Date().toISOString(),
        ...context.metadata
      }
    }
  );
}

/**
 * Discord通知の設定をテスト
 * @returns テスト結果
 */
export async function testDiscordConfiguration(): Promise<SendResult> {
  return sendCustomNotification(
    'Discord設定テスト',
    'Discord通知が正常に動作しています。',
    'info',
    {
      type: 'CONFIG_TEST',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  );
} 