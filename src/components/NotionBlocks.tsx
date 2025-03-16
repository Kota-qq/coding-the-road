import React from 'react';

interface RichTextContent {
  plain_text: string;
  text: {
    content: string;
    link?: {
      url: string;
    };
  };
  annotations?: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
  };
}

interface BlockContent {
  rich_text: RichTextContent[];
}

interface NotionBlock {
  type: string;
  id: string;
  [key: string]: any;
}

interface NotionBlocksProps {
  blocks: NotionBlock[];
}

const NotionBlocks: React.FC<NotionBlocksProps> = ({ blocks }) => {
  const renderBlock = (block: NotionBlock): React.ReactElement | null => {
    const { type, id } = block;
    const value = block[type] as BlockContent;

    if (!value?.rich_text) return null;

    switch (type) {
      case 'paragraph':
        return (
          <p key={id} className="mb-4">
            {value.rich_text.map((text, i) => text.plain_text).join('')}
          </p>
        );
      case 'heading_1':
        return (
          <h1 key={id} className="text-3xl font-bold mb-4">
            {value.rich_text.map((text, i) => text.plain_text).join('')}
          </h1>
        );
      case 'heading_2':
        return (
          <h2 key={id} className="text-2xl font-bold mb-3">
            {value.rich_text.map((text, i) => text.plain_text).join('')}
          </h2>
        );
      case 'heading_3':
        return (
          <h3 key={id} className="text-xl font-bold mb-2">
            {value.rich_text.map((text, i) => text.plain_text).join('')}
          </h3>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {blocks.map((block) => renderBlock(block))}
    </div>
  );
};

export default NotionBlocks; 