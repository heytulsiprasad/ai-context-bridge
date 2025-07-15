# AI Context Bridge Chrome Extension

A Chrome extension that bridges webpage content to external AI services, allowing users to easily send selected text or page content to Claude, ChatGPT, and Grok with a convenient draggable interface.

## Features

### Core Functionality
- **Draggable Drawer**: Appears as a floating drawer on all webpages with customizable positioning
- **Global Position Memory**: Remembers drawer position across all websites and syncs across devices
- **Smart URL Detection**: Automatically detects content type and shows relevant options
- **Shadow DOM Isolation**: Prevents style conflicts with host pages

### AI Service Integration
- **Claude**: Opens new tab with pre-filled "Read from [URL]" prompt
- **ChatGPT**: Opens new tab with pre-filled "Read from [URL]" prompt
- **Perplexity**: Opens new tab with pre-filled "Read from [URL]" prompt with internet focus
- **Grok**: Opens new tab with pre-filled "Read from [URL]" prompt
- **Copy as Markdown**: Copies simple URL prompt to clipboard for any AI service

### YouTube Integration
- **YouTube Video Detection**: Shows special "Copy YouTube Video" option when on YouTube
- **Video Summarization**: Copies "Watch this video: [URL]" prompt for AI video analysis

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Usage

### Draggable Drawer
1. Visit any webpage
2. Find the floating drawer icon on the right side of the screen
3. Drag it up or down to your preferred position (position is remembered globally)
4. Hover over the drawer to expand the menu
5. Click on your desired AI service or copy option

### YouTube Videos
1. Visit any YouTube video page
2. The drawer will show an additional "Copy YouTube Video" option
3. Click to copy a video analysis prompt to your clipboard

### Extension Settings
1. Click the extension icon in the browser toolbar
2. Toggle the extension on/off
3. Exclude specific websites using regex patterns

## File Structure

```
├── manifest.json           # Extension configuration
├── background.js           # Background script for tab handling
├── content_global.js       # Global content script (draggable drawer)
├── content_chatgpt.js      # ChatGPT-specific content script
├── popup.html              # Extension popup interface
├── popup.js                # Popup functionality
├── popup.css               # Popup styles
├── styles.css              # Global drawer styles
├── styles_chat.css         # ChatGPT-specific styles
├── icons/                  # Extension and AI service icons
│   ├── icon16.png          # Extension icon (16px)
│   ├── icon48.png          # Extension icon (48px)
│   ├── icon128.png         # Extension icon (128px)
│   ├── claude.png          # Claude AI icon
│   ├── chatgpt.jpg         # ChatGPT icon
│   ├── grok.png            # Grok icon
│   └── ext-link.png        # External link icon
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

## 🚀 Future Roadmap

### High Priority
- **ChatGPT Thread Extraction**: Add button to copy entire ChatGPT conversation threads as formatted markdown
- ~~**Perplexity Integration**: Add support for Perplexity with URL parameters~~ ✅ **COMPLETED**
- **More AI Services**: Add support for Anthropic Console and other AI platforms
- **Context Menus**: Right-click context menu integration for selected text
- **Keyboard Shortcuts**: Configurable hotkeys for quick AI service access

### Medium Priority
- **Smart Content Detection**: Automatically detect and handle different content types (articles, code, tables)
- **Conversation Continuity**: Import/export conversation history between different AI services
- **Custom Prompts**: Allow users to create and save custom prompt templates
- **Multi-language Support**: Localization for different languages

### Low Priority
- **Theme Customization**: Dark/light theme options and custom color schemes
- **Analytics Dashboard**: Usage statistics and AI service preferences
- **Team Collaboration**: Share prompts and configurations across team members
- **API Integration**: Direct integration with AI service APIs for seamless experience

### Experimental
- **AI Service Comparison**: Side-by-side comparison of responses from different AI services
- **Voice Integration**: Voice-to-text for hands-free AI interaction
- **Mobile Extension**: Support for mobile browsers with touch-friendly interface

## Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests.

## License

MIT License - see LICENSE file for details