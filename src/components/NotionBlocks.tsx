"use client";

import React from 'react';

/**
 * Notion Rich Text Interface
 * @description Notionのリッチテキストコンテンツの型定義
 */
interface RichTextContent {
  plain_text: string;
  text?: {
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

/**
 * Notion Block Content Interface
 * @description Notionブロックの基本的なコンテンツ構造
 */
interface BlockContent {
  rich_text: RichTextContent[];
  language?: string; // コードブロック用
  caption?: RichTextContent[]; // コードブロック用
}

/**
 * Table Block Content Interface
 * @description テーブルブロック専用の構造
 */
interface TableContent {
  table_width: number;
  has_column_header: boolean;
  has_row_header: boolean;
}

/**
 * Table Row Content Interface  
 * @description テーブル行専用の構造
 */
interface TableRowContent {
  cells: RichTextContent[][];
}

/**
 * Notion Block Interface
 * @description Notionブロックの型定義
 */
interface NotionBlock {
  type: string;
  id: string;
  paragraph?: BlockContent;
  heading_1?: BlockContent;
  heading_2?: BlockContent;
  heading_3?: BlockContent;
  code?: BlockContent;
  table?: TableContent;
  table_row?: TableRowContent;
  [key: string]: BlockContent | TableContent | TableRowContent | string | undefined;
}

/**
 * NotionBlocks Props Interface
 */
interface NotionBlocksProps {
  blocks: NotionBlock[];
}

/**
 * NotionBlocks Component
 * @description Notionのブロックコンテンツをレンダリングするコンポーネント
 */
const NotionBlocks: React.FC<NotionBlocksProps> = ({ blocks }) => {
  // デバッグ用: コードブロックのデータ構造をログ出力（簡略化）
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const codeBlocks = blocks.filter(block => block.type === 'code');
      if (codeBlocks.length > 0) {
        console.log(`🔍 コードブロック発見: ${codeBlocks.length}件`);
      }
      
      // 未サポートブロックタイプの一覧表示（重複排除）
      const supportedTypes = ['paragraph', 'heading_1', 'heading_2', 'heading_3', 'code', 'bulleted_list_item', 'table', 'table_row'];
      const unsupportedTypes = [...new Set(
        blocks
          .filter(block => !supportedTypes.includes(block.type))
          .map(block => block.type)
      )];
      
      if (unsupportedTypes.length > 0) {
        console.log(`⚠️ 未サポートブロック: ${unsupportedTypes.join(', ')}`);
      }
    }
  }, [blocks]);

  /**
   * リッチテキストをレンダリング
   * @param richTextArray - リッチテキストの配列
   * @returns JSX要素の配列
   */
  const renderRichText = (richTextArray: RichTextContent[]) => {
    return richTextArray.map((text, index) => {
      let element: React.ReactNode = text.plain_text;

      if (text.annotations) {
        if (text.annotations.bold) {
          element = <strong key={`bold-${index}`}>{element}</strong>;
        }
        if (text.annotations.italic) {
          element = <em key={`italic-${index}`}>{element}</em>;
        }
        if (text.annotations.code) {
          element = (
            <code 
              key={`code-${index}`}
              className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs sm:text-sm font-mono"
            >
              {element}
            </code>
          );
        }
      }

      if (text.text?.link) {
        element = (
          <a
            key={`link-${index}`}
            href={text.text.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {element}
          </a>
        );
      }

      return <span key={index}>{element}</span>;
    });
  };

  /**
   * 個別のブロックをレンダリング
   * @param block - Notionブロック
   * @returns JSX要素またはnull
   */
  const renderBlock = (block: NotionBlock): React.ReactElement | null => {
    const { type, id } = block;
    const value = block[type] as BlockContent;

    // コードブロックの特別処理
    if (type === 'code') {
      const language = value?.language || 'text';
      const codeText = value?.rich_text?.map((text) => text.plain_text).join('') || '';
      
      return (
        <div key={id} className="mb-4 sm:mb-6">
          <pre className="bg-gray-900 text-gray-100 rounded-lg p-3 sm:p-4 overflow-x-auto">
            <div className="text-xs text-gray-400 mb-2 uppercase">{language}</div>
            <code className="font-mono text-xs sm:text-sm whitespace-pre">
              {codeText}
            </code>
          </pre>
        </div>
      );
    }

    // bulleted_list_itemのサポートを追加
    if (type === 'bulleted_list_item') {
      if (!value?.rich_text) {
        return null;
      }
      return (
        <li key={id} className="mb-1 text-sm sm:text-base text-gray-700 leading-relaxed">
          {renderRichText(value.rich_text)}
        </li>
      );
    }

    // tableのサポートを追加
    if (type === 'table') {
      // テーブルブロックは次に続くtable_rowブロックと組み合わせて処理される
      return null; // テーブル自体は何も表示しない
    }

    // table_rowのサポートを追加
    if (type === 'table_row') {
      // テーブル行は個別に処理せず、グループ化で処理
      return null;
    }

    // その他のブロックタイプはrich_textが必要
    if (!value?.rich_text) {
      return null;
    }

    switch (type) {
      case 'paragraph':
        return (
          <p key={id} className="mb-3 text-sm sm:text-base text-gray-700 leading-relaxed">
            {renderRichText(value.rich_text)}
          </p>
        );
      case 'heading_1':
        return (
          <h1 key={id} className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-gray-900 leading-tight">
            {renderRichText(value.rich_text)}
          </h1>
        );
      case 'heading_2':
        return (
          <h2 key={id} className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 leading-tight">
            {renderRichText(value.rich_text)}
          </h2>
        );
      case 'heading_3':
        return (
          <h3 key={id} className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900 leading-tight">
            {renderRichText(value.rich_text)}
          </h3>
        );
      default:
        // 未サポートのブロックタイプは静かに無視（ログなし）
        return null;
    }
  };

  return (
    <div className="max-w-none">
      {(() => {
        const renderedBlocks: React.ReactElement[] = [];
        let currentListItems: React.ReactElement[] = [];
        let currentTableData: { tableInfo: TableContent | null; rows: TableRowContent[] } = { tableInfo: null, rows: [] };
        
        const flushListItems = () => {
          if (currentListItems.length > 0) {
            renderedBlocks.push(
              <ul key={`list-${renderedBlocks.length}`} className="mb-3 sm:mb-4 ml-3 sm:ml-4 list-disc list-inside space-y-1">
                {currentListItems}
              </ul>
            );
            currentListItems = [];
          }
        };

        const flushTable = () => {
          if (currentTableData.tableInfo && currentTableData.rows.length > 0) {
            const tableElement = renderTable(currentTableData.tableInfo, currentTableData.rows, `table-${renderedBlocks.length}`);
            if (tableElement) {
              renderedBlocks.push(tableElement);
            }
            currentTableData = { tableInfo: null, rows: [] };
          }
        };

        const renderTable = (tableInfo: TableContent, rows: TableRowContent[], key: string): React.ReactElement => {
          const { has_column_header, has_row_header } = tableInfo;
          
          try {
            return (
              <div key={key} className="mb-4 sm:mb-6 overflow-x-auto">
                <table className="min-w-full border border-gray-300 bg-white text-sm">
                  <tbody>
                    {rows.map((row, rowIndex) => {
                      const isHeaderRow = has_column_header && rowIndex === 0;
                      
                      return (
                        <tr key={`row-${rowIndex}`} className={isHeaderRow ? "bg-gray-50" : "hover:bg-gray-50"}>
                          {row.cells.map((cell, cellIndex) => {
                            const isHeaderCell = has_row_header && cellIndex === 0;
                            const CellTag = isHeaderRow || isHeaderCell ? 'th' : 'td';
                            
                            return (
                              <CellTag
                                key={`cell-${rowIndex}-${cellIndex}`}
                                className={`px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-left text-xs sm:text-sm ${
                                  isHeaderRow || isHeaderCell 
                                    ? 'font-medium text-gray-900 bg-gray-50' 
                                    : 'text-gray-700'
                                }`}
                              >
                                {cell.length > 0 ? renderRichText(cell) : ''}
                              </CellTag>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          } catch (error) {
            console.error('❌ テーブルレンダリングエラー:', error);
            return (
              <div key={key} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-600 mb-2">⚠️ テーブル表示エラー</div>
                <div className="text-xs text-red-500">
                  テーブルの表示中にエラーが発生しました
                </div>
              </div>
            );
          }
        };
        
        blocks.forEach((block) => {
          const { type } = block;
          
          if (type === 'table') {
            flushListItems();
            currentTableData.tableInfo = block.table || null;
          } else if (type === 'table_row') {
            if (block.table_row) {
              currentTableData.rows.push(block.table_row);
            }
          } else {
            flushTable();
            
            const renderedBlock = renderBlock(block);
            
            if (block.type === 'bulleted_list_item' && renderedBlock) {
              currentListItems.push(renderedBlock);
            } else {
              flushListItems();
              if (renderedBlock) {
                renderedBlocks.push(renderedBlock);
              }
            }
          }
        });
        
        flushListItems(); // 最後のリストアイテムを処理
        flushTable(); // 最後のテーブルを処理
        
        return renderedBlocks;
      })()}
    </div>
  );
};

export default NotionBlocks;