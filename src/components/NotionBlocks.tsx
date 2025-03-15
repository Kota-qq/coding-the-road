interface NotionBlocksProps {
  blocks: any[];
}

export default function NotionBlocks({ blocks }: NotionBlocksProps) {
  const renderBlock = (block: any) => {
    const { type, id } = block;
    const value = block[type];

    switch (type) {
      case 'paragraph':
        return (
          <p key={id} className="mb-4">
            {value.rich_text.map((text: any) => text.plain_text).join('')}
          </p>
        );
      case 'heading_1':
        return (
          <h1 key={id} className="text-3xl font-bold mb-4">
            {value.rich_text.map((text: any) => text.plain_text).join('')}
          </h1>
        );
      case 'heading_2':
        return (
          <h2 key={id} className="text-2xl font-bold mb-3">
            {value.rich_text.map((text: any) => text.plain_text).join('')}
          </h2>
        );
      case 'heading_3':
        return (
          <h3 key={id} className="text-xl font-bold mb-2">
            {value.rich_text.map((text: any) => text.plain_text).join('')}
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
} 