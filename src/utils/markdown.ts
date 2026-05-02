/**
 * Robust markdown → HTML renderer.
 * Handles both real \n and escaped \\n in source text.
 * Supports: headings, fenced code blocks, inline code, tables, ol/ul lists,
 * blockquotes, bold, italic, strikethrough, links, hr.
 */
export function renderMarkdown(md: string): string {
  if (!md) return '';

  // Normalize escaped newlines (\\n → \n)
  let text = md.replace(/\\n/g, '\n');

  const lines = text.split('\n');
  const out: string[] = [];

  let inCode = false;
  let inUl = false;
  let inOl = false;
  let inTable = false;
  let inBq = false;
  let tableHeadDone = false;

  function closeLists() {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  }
  function closeTable() {
    if (inTable) { out.push('</tbody></table></div>'); inTable = false; tableHeadDone = false; }
  }
  function closeBq() {
    if (inBq) { out.push('</blockquote>'); inBq = false; }
  }
  function closeAll() { closeLists(); closeTable(); closeBq(); }

  for (const raw of lines) {
    const trimmed = raw.trimStart();
    const stripped = raw.trim();

    // ── Fenced code block ──
    if (stripped.startsWith('```')) {
      closeAll();
      if (inCode) {
        out.push('</code></pre>');
        inCode = false;
      } else {
        out.push('<pre class="md-pre"><code>');
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      out.push(esc(raw));
      continue;
    }

    // ── Empty line ──
    if (stripped === '') { closeAll(); continue; }

    // ── Table separator (|---|---|) ──
    if (/^\|?\s*[-:]+[-|:\s]+$/.test(stripped)) {
      if (inTable && !tableHeadDone) {
        tableHeadDone = true;
        out.push('</thead><tbody>');
      }
      continue;
    }

    // ── Table row ──
    if (stripped.startsWith('|') && stripped.endsWith('|')) {
      closeLists(); closeBq();
      if (!inTable) {
        out.push('<div class="md-tbl"><table><thead>');
        inTable = true;
        tableHeadDone = false;
      }
      const cells = stripped.slice(1, -1).split('|').map(c => c.trim());
      const tag = tableHeadDone ? 'td' : 'th';
      out.push('<tr>' + cells.map(c => `<${tag}>${il(c)}</${tag}>`).join('') + '</tr>');
      continue;
    }
    closeTable();

    // ── Blockquote ──
    if (trimmed.startsWith('>')) {
      closeLists();
      if (!inBq) { out.push('<blockquote>'); inBq = true; }
      out.push('<p>' + il(trimmed.replace(/^>\s?/, '')) + '</p>');
      continue;
    }
    closeBq();

    // ── Heading ──
    const hm = stripped.match(/^(#{1,6})\s+(.+)/);
    if (hm) {
      closeLists();
      out.push(`<h${hm[1].length}>${il(hm[2])}</h${hm[1].length}>`);
      continue;
    }

    // ── HR ──
    if (/^[-*_]{3,}$/.test(stripped)) { closeLists(); out.push('<hr>'); continue; }

    // ── Unordered list ──
    const ulm = stripped.match(/^[-*+]\s+(.+)/);
    if (ulm) {
      if (inOl) { closeLists(); }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push('<li>' + il(ulm[1]) + '</li>');
      continue;
    }

    // ── Ordered list ──
    const olm = stripped.match(/^\d+\.\s+(.+)/);
    if (olm) {
      if (inUl) { closeLists(); }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push('<li>' + il(olm[1]) + '</li>');
      continue;
    }

    // ── Paragraph (default) ──
    closeLists();
    out.push('<p>' + il(stripped) + '</p>');
  }

  closeAll();
  if (inCode) out.push('</code></pre>');

  return out.join('\n');
}

/* ── Helpers ── */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Inline formatting: code, bold, italic, strikethrough, link */
function il(s: string): string {
  let r = esc(s);
  // inline code (must be first to avoid nested bold/italic inside code)
  r = r.replace(/`([^`]+)`/g, '<code class="md-ic">$1</code>');
  // bold
  r = r.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // italic (single *, not inside **)
  r = r.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  // strikethrough
  r = r.replace(/~~(.+?)~~/g, '<del>$1</del>');
  // link
  r = r.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return r;
}
