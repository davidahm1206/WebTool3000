import './style.css';
import { cleanHtml, parsePlainText } from './parser';

const pasteArea = document.getElementById('paste-area') as HTMLDivElement;
const htmlOutput = document.getElementById('html-output') as HTMLTextAreaElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const keepFormattingCb = document.getElementById('keep-formatting') as HTMLInputElement;
const useTheadCb = document.getElementById('use-thead') as HTMLInputElement;
const useSpanCb = document.getElementById('use-span') as HTMLInputElement;

const tableClassInput = document.getElementById('table-class') as HTMLInputElement;
const tableStyleInput = document.getElementById('table-style') as HTMLInputElement;
const tdClassInput = document.getElementById('td-class') as HTMLInputElement;
const tdStyleInput = document.getElementById('td-style') as HTMLInputElement;
const textClassInput = document.getElementById('text-class') as HTMLInputElement;
const textStyleInput = document.getElementById('text-style') as HTMLInputElement;
const extractBtn = document.getElementById('extract-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

let lastHtml = '';
let lastText = '';

function render() {
  let result = '';
  const keepFormatting = keepFormattingCb.checked;
  
  const options = {
    keepFormatting: keepFormattingCb.checked,
    useThead: useTheadCb.checked,
    useSpan: useSpanCb.checked,
    tableClass: tableClassInput.value,
    tableStyle: tableStyleInput.value,
    tdClass: tdClassInput.value,
    tdStyle: tdStyleInput.value,
    textClass: textClassInput.value,
    textStyle: textStyleInput.value
  };

  if (lastHtml) {
    result = cleanHtml(lastHtml, options);
  } else if (lastText) {
    result = parsePlainText(lastText, keepFormattingCb.checked, useSpanCb.checked, textClassInput.value, textStyleInput.value);
  }

  htmlOutput.value = result;
}

keepFormattingCb.addEventListener('change', render);
useTheadCb.addEventListener('change', render);
useSpanCb.addEventListener('change', render);
tableClassInput.addEventListener('input', render);
tableStyleInput.addEventListener('input', render);
tdClassInput.addEventListener('input', render);
tdStyleInput.addEventListener('input', render);
textClassInput.addEventListener('input', render);
textStyleInput.addEventListener('input', render);

pasteArea.addEventListener('paste', (e) => {
  e.preventDefault();
  
  const clipboardData = e.clipboardData;
  if (!clipboardData) return;

  lastHtml = clipboardData.getData('text/html');
  lastText = clipboardData.getData('text/plain');

  render();
  
  // Show the sanitized output in the paste area for feedback
  // We always show formatted in the preview area
  if (lastHtml) {
    pasteArea.innerHTML = cleanHtml(lastHtml, { keepFormatting: true });
  } else if (lastText) {
    pasteArea.innerText = lastText;
  }
});

function extractStylesFromHtml(html: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const table = doc.querySelector('table');
  if (table) {
    tableClassInput.value = table.getAttribute('class') || '';
    tableStyleInput.value = table.getAttribute('style') || '';
  }
  
  const td = doc.querySelector('td, th');
  if (td) {
    tdClassInput.value = td.getAttribute('class') || '';
    tdStyleInput.value = td.getAttribute('style') || '';
  }
  
  render();
}

extractBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text.includes('<table')) {
      extractStylesFromHtml(text);
      const originalText = extractBtn.innerText;
      extractBtn.innerText = 'Extracted!';
      setTimeout(() => {
        extractBtn.innerText = originalText;
      }, 2000);
      return;
    }
  } catch (err) {
    console.warn('Clipboard read failed, falling back to prompt', err);
  }
  
  const fallback = prompt('Please paste the HTML table code here to extract its styles:');
  if (fallback) {
    extractStylesFromHtml(fallback);
  }
});

clearBtn.addEventListener('click', () => {
  tableClassInput.value = '';
  tableStyleInput.value = '';
  tdClassInput.value = '';
  tdStyleInput.value = '';
  textClassInput.value = '';
  textStyleInput.value = '';
  render();
});

copyBtn.addEventListener('click', async () => {
  if (!htmlOutput.value) return;
  
  try {
    await navigator.clipboard.writeText(htmlOutput.value);
    
    const originalText = copyBtn.innerText;
    copyBtn.innerText = 'Copied!';
    copyBtn.style.background = '#28a745';
    
    setTimeout(() => {
      copyBtn.innerText = originalText;
      copyBtn.style.background = '';
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text: ', err);
    // fallback
    htmlOutput.select();
    document.execCommand('copy');
  }
});
