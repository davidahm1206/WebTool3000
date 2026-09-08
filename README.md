# WebTool3000

WebTool3000 is a completely browser-based tool to convert rich text (such as from Microsoft Word or other websites) into clean, semantic HTML. It focuses on preserving formatting without pulling in messy inline styles or excessive tags.

## Features

- **No Servers**: Runs 100% in your browser. Your data never leaves your computer.
- **Privacy First**: No telemetry, no API calls, no AI.
- **Clean HTML**: Strips bloated inline styles and unused tags.
- **Retains Important Formatting**:
  - Bold, Italic, Underlined text
  - Hyperlinks (`href`)
  - Tables (`<table>`, `<tr>`, `<td>`, etc.)
  - Superscript numbers (e.g. footnote references, `<sup>`)

## Usage

1. Open the tool in your browser.
2. Copy text from Word, Google Docs, or any web page.
3. Paste it into the input area.
4. The clean HTML source code is generated instantly.
5. Click "Copy Output" to grab your HTML.

## Development

This project is built with **Vite** and **Vanilla TypeScript**.

To run it locally:

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

## Design

The UI features a clean, solid-color aesthetic (no gradients) focused on typography and user experience.
