interface DiscordMessage {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
}

/**
 * Discordにエラーを通知する
 */
export async function sendDiscordNotification(
  error: Error,
  context: Record<string, unknown> = {}
): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('DISCORD_WEBHOOK_URL is not set');
    return;
  }

  const message: DiscordMessage = {
    embeds: [{
      title: '🚨 エラーが発生しました',
      description: error.message,
      color: 0xFF0000, // 赤色
      fields: [
        {
          name: 'エラータイプ',
          value: error.name,
          inline: true
        },
        {
          name: '発生時刻',
          value: new Date().toISOString(),
          inline: true
        },
        {
          name: 'スタックトレース',
          value: error.stack?.slice(0, 1000) || 'スタックトレースなし'
        },
        ...Object.entries(context).map(([key, value]) => ({
          name: key,
          value: JSON.stringify(value, null, 2).slice(0, 1000),
          inline: false
        }))
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      console.error('Discord notification failed:', await response.text());
    }
  } catch (err) {
    console.error('Failed to send Discord notification:', err);
  }
} 