export interface ParserOptions {
  keepFormatting?: boolean;
  useThead?: boolean;
  useSpan?: boolean;
  tableClass?: string;
  tableStyle?: string;
  tdClass?: string;
  tdStyle?: string;
  textClass?: string;
  textStyle?: string;
}

export function cleanHtml(html: string, options: ParserOptions = {}): string {
  const { keepFormatting = true, useThead = false, useSpan = false } = options;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const cleanNode = (node: Node, inTable: boolean = false, inList: boolean = false): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.textContent || '';
      text = text.replace(/\s+/g, ' ');
      return escapeHtml(text);
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      let innerHTML = '';

      const isTableContext = inTable || tag === 'table' || tag === 'tbody' || tag === 'thead' || tag === 'tr' || tag === 'td' || tag === 'th';
      const isListContext = inList || tag === 'ul' || tag === 'ol' || tag === 'li';
      
      const tableAttr = `${options.tableClass ? ` class="${options.tableClass}"` : ''}${options.tableStyle ? ` style="${options.tableStyle}"` : ''}`;
      const tdAttr = `${options.tdClass ? ` class="${options.tdClass}"` : ''}${options.tdStyle ? ` style="${options.tdStyle}"` : ''}`;
          
          if (tag === 'table' && useThead) {
            const trs = Array.from(el.querySelectorAll('tr'));
            if (trs.length > 0) {
              let theadInner = '';
              let tbodyInner = '';
              trs.forEach((tr, i) => {
                if (i === 0) {
                  Array.from(tr.querySelectorAll('td')).forEach(td => {
                    const th = document.createElement('th');
                    if (td.hasAttribute('rowspan')) th.setAttribute('rowspan', td.getAttribute('rowspan')!);
                    if (td.hasAttribute('colspan')) th.setAttribute('colspan', td.getAttribute('colspan')!);
                    Array.from(td.childNodes).forEach(c => th.appendChild(c.cloneNode(true)));
                    if (td.parentNode) td.parentNode.replaceChild(th, td);
                  });
                  theadInner += cleanNode(tr, true, false);
                } else {
                  tbodyInner += cleanNode(tr, true, false);
                }
              });
              return `\n<table${tableAttr}>\n    <thead>\n${theadInner}    </thead>\n    <tbody>\n${tbodyInner}    </tbody>\n</table>\n`;
            }
          }
    
          for (const child of Array.from(el.childNodes)) {
            innerHTML += cleanNode(child, isTableContext, isListContext);
          }
    
          switch (tag) {
            case 'b':
            case 'strong':
              return keepFormatting && innerHTML.trim() ? `<b>${innerHTML}</b>` : innerHTML;
            case 'i':
            case 'em':
              return keepFormatting && innerHTML.trim() ? `<i>${innerHTML}</i>` : innerHTML;
            case 'u':
              // Always strip <u> tags (word adds them to links unnecessarily) but keep content
              return innerHTML;
            case 'sup':
              return keepFormatting && innerHTML.trim() ? `<sup>${innerHTML}</sup>` : innerHTML;
            case 'a':
              const href = el.getAttribute('href');
              return keepFormatting && href && innerHTML.trim() ? `<a href="${href}" target="_blank">${innerHTML}</a>` : innerHTML;
            case 'p':
            case 'div':
            case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
              const content = innerHTML.trim();
              if (!content) return '';
              const textTag = useSpan ? 'span' : 'p';
              const textAttr = `${options.textClass ? ` class="${options.textClass}"` : ''}${options.textStyle ? ` style="${options.textStyle}"` : ''}`;
              return (inTable || isListContext) ? `${content} ` : `<${textTag}${textAttr}>${content}</${textTag}>\n`;
            case 'ol':
              return innerHTML.trim() ? `<ol style="padding-left: 20px; font-size: 0.9em; line-height: 1.7;">\n${innerHTML}</ol>\n` : '';
            case 'ul':
              return innerHTML.trim() ? `<ul style="padding-left: 20px; font-size: 0.9em; line-height: 1.7;">\n${innerHTML}</ul>\n` : '';
            case 'li':
              return innerHTML.trim() ? `    <li style="margin-bottom: 10px;">${innerHTML.trim()}</li>\n` : '';
            case 'table':
              return innerHTML.trim() ? `\n<table${tableAttr}>\n${innerHTML}</table>\n` : '';
            case 'thead':
            case 'tbody':
              return innerHTML.trim() ? `    <${tag}>\n${innerHTML}    </${tag}>\n` : '';
            case 'tr':
              return innerHTML.trim() ? `        <tr>\n${innerHTML}        </tr>\n` : '';
        case 'th':
        case 'td':
          let cellAttr = tdAttr;
          const rowspan = el.getAttribute('rowspan');
          const colspan = el.getAttribute('colspan');
          if (rowspan) cellAttr += ` rowspan="${rowspan}"`;
          if (colspan) cellAttr += ` colspan="${colspan}"`;
          return `            <${tag}${cellAttr}>${innerHTML.trim()}</${tag}>\n`;
        case 'span':
          const style = el.getAttribute('style') || '';
          if (style.includes('vertical-align: super') || style.includes('vertical-align:super') || style.includes('mso-text-raise')) {
            return keepFormatting && innerHTML.trim() ? `<sup>${innerHTML}</sup>` : innerHTML;
          }
          return innerHTML;
        case 'br':
          return (inTable || isListContext) ? ' ' : '<br>';
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

export function parsePlainText(text: string, keepFormatting: boolean = true, useSpan: boolean = false, textClass: string = '', textStyle: string = ''): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  let html = escapeHtml(text);
  if (keepFormatting) {
    html = html.replace(urlRegex, '<a href="$1">$1</a>');
  }
  
  return html.split(/\n\s*\n/).map(p => {
    let cleaned = p.replace(/[\r\n]+/g, ' ').trim();
    const textTag = useSpan ? 'span' : 'p';
    const textAttr = `${textClass ? ` class="${textClass}"` : ''}${textStyle ? ` style="${textStyle}"` : ''}`;
    return cleaned ? `<${textTag}${textAttr}>${cleaned}</${textTag}>` : '';
  }).filter(Boolean).join('');
}

function escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}
