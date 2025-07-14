# AI Context Bridge Chrome Extension

A Chrome extension that bridges webpage content to external AI services, allowing users to easily send selected text or page content to ChatGPT, Grok, Cursor, and Cloud Code.

## Features

### Core Functionality
- **Floating Action Button**: Appears on all webpages with a dropdown menu
- **Text Selection Detection**: Automatically captures selected text
- **Page Content Extraction**: Falls back to main page content when no text is selected
- **Shadow DOM Isolation**: Prevents style conflicts with host pages

### AI Service Integration
- **ChatGPT**: Opens new tab with pre-filled prompt
- **Grok**: Opens new tab with pre-filled prompt  
- **Cursor**: Copies formatted context to clipboard
- **Cloud Code**: Copies formatted context to clipboard

### ChatGPT Conversation Export
- **Copy Button**: Injected into ChatGPT interface
- **Conversation Scraping**: Extracts all user and assistant messages
- **Clipboard Export**: Formats and copies conversation history

## Installation

1. Clone or download this repository
2. Add icon files to the `icons/` directory (see `icons/README.md`)
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extension directory

## Usage

### Global Floating Button
1. Visit any webpage
2. Click the floating blue button in the bottom-right corner
3. Select your desired AI service from the dropdown
4. Selected text (or page content) will be sent to the chosen service

### ChatGPT Conversation Export
1. Visit `chat.openai.com`
2. Click the "Copy Conversation" button in the top-right corner
3. The formatted conversation will be copied to your clipboard

## File Structure

```
├── manifest.json           # Extension configuration
├── background.js           # Background script for tab/clipboard handling
├── content_global.js       # Global content script (floating button)
├── content_chatgpt.js      # ChatGPT-specific content script
├── styles.css              # Global styles
├── styles_chat.css         # ChatGPT-specific styles
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Permissions

- `activeTab`: Access to current tab content
- `scripting`: Inject content scripts
- `storage`: Store extension settings
- `clipboardWrite`: Copy content to clipboard

## Development

This extension was built following a test-driven, incremental development approach across 7 phases:

1. **Initial Project Setup**: Basic file structure and manifest
2. **Floating Button**: Button injection with shadow DOM
3. **Dropdown Menu**: Interactive menu with styling
4. **Context Detection**: Text selection and communication
5. **Background Logic**: Tab opening and URL construction
6. **Conversation Exporter**: ChatGPT-specific functionality
7. **Final Wiring**: Clipboard integration and content extraction

## Browser Support

- Chrome (Manifest V3)
- Other Chromium-based browsers

## License

MIT License - see LICENSE file for details