import './style.css';
import { cleanHtml, parsePlainText } from './parser';

const pasteArea = document.getElementById('paste-area') as HTMLDivElement;
const htmlOutput = document.getElementById('html-output') as HTMLTextAreaElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;

pasteArea.addEventListener('paste', (e) => {
  e.preventDefault();
  
  const clipboardData = e.clipboardData;
  if (!clipboardData) return;

  const html = clipboardData.getData('text/html');
  const text = clipboardData.getData('text/plain');

  let result = '';

  if (html) {
    result = cleanHtml(html);
  } else if (text) {
    result = parsePlainText(text);
  }

  htmlOutput.value = result;
  
  // Show the sanitized output in the paste area for feedback
  if (html) {
    pasteArea.innerHTML = result;
  } else if (text) {
    pasteArea.innerText = text;
  }
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
