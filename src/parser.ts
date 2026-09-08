export function cleanHtml(html: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const cleanNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent || '');
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      let innerHTML = '';
      
      for (const child of Array.from(el.childNodes)) {
        innerHTML += cleanNode(child);
      }

      switch (tag) {
        case 'b':
        case 'strong':
          return innerHTML.trim() ? `<b>${innerHTML}</b>` : '';
        case 'i':
        case 'em':
          return innerHTML.trim() ? `<i>${innerHTML}</i>` : '';
        case 'u':
          return innerHTML.trim() ? `<u>${innerHTML}</u>` : '';
        case 'sup':
          return innerHTML.trim() ? `<sup>${innerHTML}</sup>` : '';
        case 'a':
          const href = el.getAttribute('href');
          return href && innerHTML.trim() ? `<a href="${href}">${innerHTML}</a>` : innerHTML;
        case 'p':
        case 'div':
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
          return innerHTML.trim() ? `<p>${innerHTML.trim()}</p>\n` : '';
        case 'table':
          return innerHTML.trim() ? `\n<table>\n${innerHTML}</table>\n` : '';
        case 'thead':
        case 'tbody':
        case 'tr':
          return innerHTML.trim() ? `<${tag}>\n${innerHTML}</${tag}>\n` : '';
        case 'th':
        case 'td':
          return innerHTML.trim() ? `  <${tag}>${innerHTML.trim()}</${tag}>\n` : '';
        case 'span':
          const style = el.getAttribute('style') || '';
          if (style.includes('vertical-align: super') || style.includes('vertical-align:super') || style.includes('mso-text-raise')) {
            return innerHTML.trim() ? `<sup>${innerHTML}</sup>` : '';
          }
          return innerHTML;
        case 'br':
          return '<br>\n';
        default:
          return innerHTML;
      }
    }
    return '';
  };

  let result = '';
  // Loop over top level children to avoid wrapping the whole body content implicitly if we don't need to
  for (const child of Array.from(body.childNodes)) {
    result += cleanNode(child);
  }
  
  result = result.replace(/\n\s*\n/g, '\n').trim();

  return result;
}

export function parsePlainText(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let html = escapeHtml(text);
  html = html.replace(urlRegex, '<a href="$1">$1</a>');
  
  return html.split(/\n/).map(p => {
    const trimmed = p.trim();
    return trimmed ? `<p>${trimmed}</p>` : '';
  }).filter(Boolean).join('\n');
}

function escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
