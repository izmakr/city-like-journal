import React from 'react';
import Image from 'next/image';

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  // 本文をパースして、段落、リスト、太字などを処理
  const parseContent = (text: string) => {
    // まず、・で始まる行（店舗情報）を検出
    const lines = text.split('\n');
    const blocks: Array<{ 
      type: 'paragraph' | 'table' | 'heading' | 'image' | 'video'; 
      content: string | Array<{ key: string; value: string }>; 
      level?: number;
      url?: string;
      alt?: string;
    }> = [];
    let currentParagraph: string[] = [];
    let currentTable: Array<{ key: string; value: string }> = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'paragraph', content: currentParagraph.join('\n') });
        currentParagraph = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        blocks.push({ type: 'table', content: currentTable });
        currentTable = [];
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      
      // 空行の場合は段落を区切る
      if (trimmed === '') {
        flushTable();
        flushParagraph();
        continue;
      }

      // 見出し（## または ###）を検出
      if (trimmed.startsWith('##')) {
        flushTable();
        flushParagraph();
        const level = trimmed.match(/^#+/)?.[0].length || 2;
        const headingText = trimmed.replace(/^#+\s*/, '');
        blocks.push({ type: 'heading', content: headingText, level });
        continue;
      }

      // 画像: ![alt](url) または [img:url] または [img:url:alt]
      const imageMarkdownMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      const imageSimpleMatch = trimmed.match(/^\[img:([^\]]+)(?::([^\]]+))?\]$/);
      if (imageMarkdownMatch || imageSimpleMatch) {
        flushTable();
        flushParagraph();
        const match = imageMarkdownMatch || imageSimpleMatch;
        if (match) {
          const url = imageMarkdownMatch ? match[2] : match[1];
          const alt = imageMarkdownMatch ? match[1] : (match[2] || '');
          blocks.push({ type: 'image', content: '', url, alt });
        }
        continue;
      }

      // 動画: [video:url] または [video:url:説明]
      const videoMatch = trimmed.match(/^\[video:([^\]]+)(?::([^\]]+))?\]$/);
      if (videoMatch) {
        flushTable();
        flushParagraph();
        blocks.push({ type: 'video', content: '', url: videoMatch[1], alt: videoMatch[2] || '' });
        continue;
      }

      // ・で始まる行は店舗情報（テーブル項目）
      if (trimmed.startsWith('・')) {
        flushParagraph();
        const item = trimmed.substring(1).trim(); // 「・」を除去
        
        // 「:」や「 」で分割してキーとバリューに分ける
        let key = item;
        let value = '';
        
        if (item.includes(':')) {
          const colonIndex = item.indexOf(':');
          key = item.substring(0, colonIndex).trim();
          value = item.substring(colonIndex + 1).trim();
        } else if (item.includes(' ')) {
          // スペースで区切られている場合（例：「電源/WiFi ◯」）
          const parts = item.split(/\s+/);
          if (parts.length >= 2) {
            key = parts.slice(0, -1).join(' ');
            value = parts[parts.length - 1];
          }
        }
        
        currentTable.push({ key, value });
      } else {
        flushTable();
        currentParagraph.push(line);
      }
    }

    flushTable();
    flushParagraph();

    return blocks;
  };

  // 太字を処理（**テキスト** または *テキスト*）
  const renderText = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let currentIndex = 0;

    // **text** 形式（優先）
    const boldPattern = /\*\*([^*]+)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(text)) !== null) {
      // マッチ前のテキスト
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // 太字
      parts.push(<strong key={currentIndex++} className="font-semibold text-white">{match[1]}</strong>);
      lastIndex = match.index + match[0].length;
    }

    // 残りのテキスト
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : text;
  };

  const blocks = parseContent(content);

  return (
    <div className="space-y-6">
      {blocks.map((block, blockIndex) => {
        if (block.type === 'heading') {
          const headingText = block.content as string;
          const level = Math.min(block.level || 2, 6);
          const headingClassName = `mt-16 mb-8 font-bold text-gray-100 ${
            level === 2 ? 'text-xl sm:text-2xl' : 
            level === 3 ? 'text-lg sm:text-xl' : 
            'text-base sm:text-lg'
          }`;
          const headingContent = renderText(headingText);
          
          if (level === 2) return <h2 key={blockIndex} className={headingClassName}>{headingContent}</h2>;
          if (level === 3) return <h3 key={blockIndex} className={headingClassName}>{headingContent}</h3>;
          if (level === 4) return <h4 key={blockIndex} className={headingClassName}>{headingContent}</h4>;
          if (level === 5) return <h5 key={blockIndex} className={headingClassName}>{headingContent}</h5>;
          return <h6 key={blockIndex} className={headingClassName}>{headingContent}</h6>;
        } else if (block.type === 'table') {
          const tableData = block.content as Array<{ key: string; value: string }>;
          return (
            <div key={blockIndex} className="overflow-hidden rounded-xl border" style={{ borderColor: '#1F2633', background: '#131823' }}>
              <table className="w-full border-collapse">
                <tbody>
                  {tableData.map((row, rowIndex) => {
                    const isAddress = row.key === '住所';
                    const googleMapsUrl = isAddress && row.value
                      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(row.value)}`
                      : null;
                    
                    return (
                      <tr 
                        key={rowIndex} 
                        className={rowIndex < tableData.length - 1 ? 'border-b' : ''}
                        style={{ borderColor: '#1F2633' }}
                      >
                        <td className="py-3 px-3 sm:px-4 text-sm font-medium text-gray-300 align-top w-[35%] sm:w-[40%]">
                          {renderText(row.key)}
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-sm text-gray-200 align-top">
                          {isAddress && googleMapsUrl ? (
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-[#7DB3D3] hover:underline transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              {renderText(row.value || '')}
                              <svg
                                className="w-3.5 h-3.5 inline-block"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : (
                            renderText(row.value || '')
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        } else if (block.type === 'image') {
          return (
            <figure key={blockIndex} className="my-6">
              <div className="relative w-full aspect-video sm:aspect-[16/9] rounded-xl overflow-hidden border" style={{ borderColor: '#1F2633' }}>
                <Image
                  src={block.url || ''}
                  alt={block.alt || ''}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(min-width: 1024px) 768px, 100vw"
                />
              </div>
              {block.alt && (
                <figcaption className="mt-2 text-xs text-gray-400 text-center">
                  {block.alt}
                </figcaption>
              )}
            </figure>
          );
        } else if (block.type === 'video') {
          return (
            <figure key={blockIndex} className="my-6">
              <div className="relative w-full aspect-video sm:aspect-[16/9] rounded-xl overflow-hidden border" style={{ borderColor: '#1F2633' }}>
                <video
                  src={block.url || ''}
                  controls
                  className="w-full h-full"
                  style={{ background: '#0B0E13' }}
                >
                  お使いのブラウザは動画タグをサポートしていません。
                </video>
              </div>
              {block.alt && (
                <figcaption className="mt-2 text-xs text-gray-400 text-center">
                  {block.alt}
                </figcaption>
              )}
            </figure>
          );
        } else {
          // 段落
          const paragraphText = block.content as string;
          // 段落内の改行を適切に処理（スマホファースト）
          const lines = paragraphText.split('\n');
          return (
            <div key={blockIndex} className="space-y-3">
              {lines.map((line, lineIndex) => {
                if (line.trim() === '') return null;
                return (
                  <p key={lineIndex} className="leading-7 sm:leading-8 text-[14px] sm:text-[15px] text-gray-200">
                    {renderText(line)}
                  </p>
                );
              })}
            </div>
          );
        }
      })}
    </div>
  );
}

