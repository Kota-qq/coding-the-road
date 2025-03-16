import { Client } from '@notionhq/client';
import { cache } from 'react';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID || '';

interface NotionProperties {
  Title: {
    type: 'title';
    title: Array<{
      plain_text: string;
    }>;
  };
  Date: {
    type: 'date';
    date: {
      start: string;
    };
  };
  Description: {
    type: 'rich_text';
    rich_text: Array<{
      plain_text: string;
    }>;
  };
}

interface NotionPost {
  id: string;
  properties: NotionProperties;
  content?: Array<{
    type: string;
    id: string;
    [key: string]: any;
  }>;
}

export const getPosts = cache(async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
    sorts: [
      {
        property: 'Date',
        direction: 'descending',
      },
    ],
  });

  return response.results as unknown as NotionPost[];
});

export async function getPostById(pageId: string): Promise<NotionPost | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const blocks = await notion.blocks.children.list({ block_id: pageId });

    return {
      ...page,
      content: blocks.results,
    } as NotionPost;
  } catch {
    return null;
  }
} 