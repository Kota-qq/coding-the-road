import { Client } from '@notionhq/client';
import { cache } from 'react';
import { PageObjectResponse, RichTextItemResponse } from '@notionhq/client/build/src/api-endpoints';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const databaseId = process.env.NOTION_DATABASE_ID || '';

export interface NotionPost {
  id: string;
  last_edited_time: string;
  properties: {
    Title: {
      id: string;
      type: 'title';
      title: Array<RichTextItemResponse>;
    };
    Date: {
      id: string;
      type: 'date';
      date: {
        start: string;
      };
    };
    Description: {
      id: string;
      type: 'rich_text';
      rich_text: Array<RichTextItemResponse>;
    };
  };
  content?: NotionBlock[];
}

export interface NotionBlock {
  type: string;
  id: string;
  paragraph?: {
    rich_text: Array<{
      text: {
        content: string;
      };
      plain_text: string;
      annotations?: {
        bold?: boolean;
        code?: boolean;
        italic?: boolean;
        strikethrough?: boolean;
        underline?: boolean;
      };
    }>;
  };
  heading_1?: {
    rich_text: Array<{
      text: {
        content: string;
      };
      plain_text: string;
    }>;
  };
  heading_2?: {
    rich_text: Array<{
      text: {
        content: string;
      };
      plain_text: string;
    }>;
  };
  heading_3?: {
    rich_text: Array<{
      text: {
        content: string;
      };
      plain_text: string;
    }>;
  };
  [key: string]: unknown;
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

  return response.results.map(page => ({
    id: page.id,
    last_edited_time: (page as PageObjectResponse).last_edited_time,
    properties: (page as PageObjectResponse).properties as unknown as NotionPost['properties'],
  })) as NotionPost[];
});

export async function getPostById(pageId: string): Promise<NotionPost | null> {
  try {
    const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse;
    const blocks = await notion.blocks.children.list({ block_id: pageId });

    return {
      id: page.id,
      last_edited_time: page.last_edited_time,
      properties: page.properties as unknown as NotionPost['properties'],
      content: blocks.results as NotionBlock[],
    };
  } catch {
    return null;
  }
} 