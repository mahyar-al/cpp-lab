import React, { useState } from 'react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  isStreaming?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  isStreaming = false,
}) => {
  if (!content) return null;

  // Split content into blocks (code blocks, tables, lists, headers, paragraphs)
  const blocks = parseMarkdownBlocks(content);

  return (
    <div className={`markdown-body space-y-3 leading-relaxed text-inherit ${className}`} dir="rtl">
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>{renderBlock(block, idx, isStreaming && idx === blocks.length - 1)}</React.Fragment>
      ))}
    </div>
  );
};

interface Block {
  type: 'code' | 'table' | 'header' | 'list' | 'quote' | 'paragraph';
  content: string;
  lang?: string;
  level?: number;
  items?: string[];
  ordered?: boolean;
  tableData?: { headers: string[]; rows: string[][] };
}

function parseMarkdownBlocks(markdown: string): Block[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // 1. Code Block (```)
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim() || 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length && lines[i].trim().startsWith('```')) {
        i++; // skip closing ```
      }
      blocks.push({
        type: 'code',
        content: codeLines.join('\n'),
        lang,
      });
      continue;
    }

    // 2. Blockquote (> ...)
    if (line.trim().startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({
        type: 'quote',
        content: quoteLines.join('\n'),
      });
      continue;
    }

    // 3. Table (| ... | ... |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      if (tableLines.length >= 2) {
        const headers = tableLines[0]
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        // line 1 is usually the divider |---|---|
        const rows = tableLines.slice(2).map((r) =>
          r
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim())
        );
        blocks.push({
          type: 'table',
          content: '',
          tableData: { headers, rows },
        });
        continue;
      }
    }

    // 4. Headers (#, ##, ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        content: headerMatch[2],
      });
      i++;
      continue;
    }

    // 5. Unordered List (- or *)
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'list',
        ordered: false,
        items,
        content: '',
      });
      continue;
    }

    // 6. Ordered List (1. 2.)
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({
        type: 'list',
        ordered: true,
        items,
        content: '',
      });
      continue;
    }

    // 7. Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // 8. Regular paragraph
    const pLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      pLines.push(lines[i]);
      i++;
    }

    blocks.push({
      type: 'paragraph',
      content: pLines.join(' '),
    });
  }

  return blocks;
}

function renderBlock(block: Block, index: number, isLastStreamingBlock: boolean): React.ReactNode {
  switch (block.type) {
    case 'code':
      return <CodeBlock key={index} code={block.content} lang={block.lang} />;

    case 'table':
      if (!block.tableData) return null;
      return (
        <div key={index} className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-xs">
          <table className="w-full text-right text-xs sm:text-sm border-collapse" dir="rtl">
            <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
              <tr>
                {block.tableData.headers.map((h, hi) => (
                  <th key={hi} className="px-3.5 py-2.5">
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80">
              {block.tableData.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-cyan-500/5 dark:hover:bg-cyan-500/10 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3.5 py-2 text-slate-700 dark:text-slate-300">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'header': {
      const level = block.level || 2;
      const headingStyles =
        level === 1
          ? 'text-lg sm:text-xl font-black text-slate-950 dark:text-white mt-4 mb-2 pb-1.5 border-b border-cyan-500/20'
          : level === 2
          ? 'text-base sm:text-lg font-bold text-slate-900 dark:text-cyan-400 mt-3 mb-1.5'
          : 'text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1';
      return (
        <div key={index} className={headingStyles}>
          {renderInline(block.content)}
        </div>
      );
    }

    case 'list': {
      return block.ordered ? (
        <ol key={index} className="list-decimal list-inside space-y-1 my-2 text-slate-800 dark:text-slate-200 pr-1">
          {block.items?.map((item, ii) => (
            <li key={ii} className="leading-relaxed">
              <span className="inline-block mr-1">{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      ) : (
        <ul key={index} className="space-y-1.5 my-2 text-slate-800 dark:text-slate-200">
          {block.items?.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 shrink-0 shadow-sm shadow-cyan-500/50" />
              <div className="flex-1">{renderInline(item)}</div>
            </li>
          ))}
        </ul>
      );
    }

    case 'quote':
      return (
        <blockquote
          key={index}
          className="pr-3.5 py-1.5 my-2 border-r-4 border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-l-lg text-slate-700 dark:text-slate-300 italic text-xs sm:text-sm"
        >
          {renderInline(block.content)}
        </blockquote>
      );

    case 'paragraph':
    default:
      return (
        <p key={index} className="leading-relaxed my-1.5 text-slate-800 dark:text-slate-200">
          {renderInline(block.content)}
          {isLastStreamingBlock && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-500 animate-pulse align-middle rounded-sm shadow-sm shadow-cyan-500/80" />
          )}
        </p>
      );
  }
}

// Inline formatting: **bold**, *italic*, `code`, [link](url), ~~strike~~
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by inline code, bold, links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // 1. Inline Code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      parts.push(
        <code
          key={key++}
          dir="ltr"
          className="px-1.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 font-mono text-[11px] sm:text-xs border border-slate-300 dark:border-slate-700 mx-0.5 font-semibold"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // 2. Bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      parts.push(
        <strong key={key++} className="font-bold text-slate-950 dark:text-white">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // 3. Italic *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      parts.push(
        <em key={key++} className="italic text-slate-700 dark:text-slate-300">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // 4. Link [label](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      parts.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-600 dark:text-cyan-400 underline underline-offset-2 hover:text-cyan-700 dark:hover:text-cyan-300 inline-flex items-center gap-0.5"
        >
          {linkMatch[1]}
          <ExternalLink className="w-3 h-3 inline-block" />
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Regular character
    const nextSpecial = remaining.search(/[`*\[]/);
    if (nextSpecial === -1) {
      parts.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // Just a literal symbol that didn't match a full tag
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      parts.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return parts;
}

const CodeBlock: React.FC<{ code: string; lang?: string }> = ({ code, lang }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-lg text-slate-100" dir="ltr">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 font-mono">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="uppercase tracking-wider font-semibold text-slate-300">{lang || 'CODE'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">کپی شد!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>کپی کد</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-3.5 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200 selection:bg-cyan-500 selection:text-slate-950">
        <code>{code}</code>
      </pre>
    </div>
  );
};
