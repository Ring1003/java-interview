/**
 * Lightweight markdown-to-HTML renderer for interview answers.
 * Supports: headings, code blocks, inline code, tables, bold, italic, lists, blockquote, links, hr
 * No external dependency needed.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderMarkdown(md: string): string {
  if (!md) return '';

  const lines = md.split('\n');
  const html: string[] = [];
  let inCodeBlock = false;
  let inList = false;
  let listType = '';
  let inTable = false;
  let inBlockquote = false;
  let tableHeaderDone = false;

  function closeList() {
    if (inList) {
      html.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = '';
    }
  }
  function closeTable() {
    if (inTable) {
      html.push('</tbody></table></div>');
      inTable = false;
      tableHeaderDone = false;
    }
  }
  function closeBlockquote() {
    if (inBlockquote) {
      html.push('</blockquote>');
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Code block
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        html.push('</code></pre>');
        inCodeBlock = false;
      } else {
        closeList(); closeTable(); closeBlockquote();
        const lang = trimmed.slice(3).trim();
        html.push(`<pre class="md-pre"><code class="${lang ? `language-${lang}` : ''}">`);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      html.push(escapeHtml(line));
      continue;
    }

    // Empty line
    if (trimmed === '') {
      closeList(); closeTable(); closeBlockquote();
      continue;
    }

    // Table separator
    if (trimmed.match(/^\|?\s*[-:]+[-|:\s]+$/)) {
      if (inTable && !tableHeaderDone) {
        tableHeaderDone = true;
        html.push('</thead><tbody>');
      }
      continue;
    }

    // Table row
    if (trimmed.startsWith('|')) {
      closeList(); closeBlockquote();
      if (!inTable) {
        html.push('<div class="md-table-wrap"><table><thead>');
        inTable = true;
        tableHeaderDone = false;
      }
      const cells = trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
      const tag = tableHeaderDone ? 'td' : 'th';
      html.push('<tr>');
      cells.forEach(cell => {
        html.push(`<${tag}>${renderInline(cell)}</${tag}>`);
      });
      html.push('</tr>');
      continue;
    }

    // Close table if non-table line
    if (inTable) {
      closeTable();
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      closeList();
      if (!inBlockquote) {
        html.push('<blockquote class="md-blockquote">');
        inBlockquote = true;
      }
      const content = trimmed.replace(/^>\s?/, '');
      html.push(`<p>${renderInline(content)}</p>`);
      continue;
    }
    closeBlockquote();

    // Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      html.push(`<h${level} class="md-h${level}">${renderInline(text)}</h${level}>`);
      continue;
    }

    // Horizontal rule
    if (trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/)) {
      closeList();
      html.push('<hr class="md-hr"/>');
      continue;
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        html.push('<ul class="md-ul">');
        inList = true;
        listType = 'ul';
      }
      html.push(`<li>${renderInline(ulMatch[1])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        html.push('<ol class="md-ol">');
        inList = true;
        listType = 'ol';
      }
      html.push(`<li>${renderInline(olMatch[1])}</li>`);
      continue;
    }

    // Paragraph
    closeList();
    html.push(`<p>${renderInline(trimmed)}</p>`);
  }

  closeList();
  closeTable();
  closeBlockquote();
  if (inCodeBlock) {
    html.push('</code></pre>');
  }

  return html.join('\n');
}

function renderInline(text: string): string {
  let result = escapeHtml(text);

  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="md-link">$1</a>');

  // Strikethrough
  result = result.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  return result;
}
