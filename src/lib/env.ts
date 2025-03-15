const requiredEnvs = [
  'NOTION_API_KEY',
  'NOTION_DATABASE_ID',
] as const;

export function validateEnv(): void {
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      throw new Error(`Environment variable ${env} is missing`);
    }
  }
} 