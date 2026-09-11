import './style.css';
import { extractJMMHR } from './parser';

const pasteArea = document.getElementById('paste-area') as HTMLDivElement;
const htmlOutput = document.getElementById('html-output') as HTMLTextAreaElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const primaryColorInput = document.getElementById('primary-color') as HTMLInputElement;

let lastText = '';

function render() {
  if (lastText) {
    const result = extractJMMHR(lastText, primaryColorInput.value);
    htmlOutput.value = result;
  }
}

primaryColorInput.addEventListener('input', render);

pasteArea.addEventListener('paste', (e) => {
  e.preventDefault();
  
  const clipboardData = e.clipboardData;
  if (!clipboardData) return;

  lastText = clipboardData.getData('text/plain');

  // Show the pasted text
  pasteArea.innerText = lastText;

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
    htmlOutput.select();
    document.execCommand('copy');
  }
});
