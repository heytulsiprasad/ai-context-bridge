# Technical Specification: AI Context Bridge Extension

**Version:** 1.0
**Date:** July 14, 2025

## 1. Introduction

### 1.1. Project Overview

The AI Context Bridge is a Chrome browser extension designed to streamline the workflow of developers, researchers, and power users who frequently interact with Large Language Models (LLMs) and development tools. It provides two core features:

1. **Context-Aware "Open In"**: A floating action button on every webpage that allows users to send selected text or the entire page content to various AI and developer platforms with a pre-configured prompt.
2. **Conversation Exporter**: A utility to easily copy entire conversation histories from popular AI chat interfaces to the clipboard for use in other models or for documentation.

### 1.2. Target Audience

- Software Developers
- AI/ML Researchers & Enthusiasts
- Content Creators & Writers
- Students & Academics

## 2. System Architecture

The extension will be built using Chrome's Manifest V3 architecture for enhanced security, performance, and privacy.

- **`manifest.json`**: The core configuration file that defines the extension's permissions, scripts, and properties.
- **Content Scripts (`content.js`)**: JavaScript files injected into web pages. They are responsible for creating the floating UI elements (the button and dropdown menu), detecting user interactions (text selection, clicks), and communicating with the background script. A separate content script will handle injecting the "Copy Conversation" button on specific chat sites.
- **Background Script / Service Worker (`background.js`)**: The central hub of the extension. It runs in the background and listens for messages from content scripts. It handles the logic for constructing URLs and opening new tabs. It does not have DOM access.
- **UI Components**: The floating button and its associated dropdown menu will be built with HTML, styled with CSS, and managed by the content script.

## 3. Feature Specifications

### 3.1. Feature 1: Context-Aware "Open In" Button

### 3.1.1. UI/UX

- A circular, floating button will be displayed in the bottom-right corner of all web pages. It will have a subtle, non-intrusive design.
- On hover, the button will display a tooltip (e.g., "Send to AI").
- On click, a dropdown menu will appear above the button with the following options:
    - **Open in ChatGPT**
    - **Open in Grok**
    - **Open in Cursor**
    - **Open in Cloud Code**
- The UI will be rendered within a Shadow DOM to prevent CSS conflicts with the host page.

### 3.1.2. Logic

1. **Context Detection**:
    - The content script will continuously listen for `mouseup` events to detect if the user has selected text.
    - If text is selected (`window.getSelection().toString().trim() !== ''`), its value will be stored.
    - If no text is selected when an option is clicked, the extension will fall back to using the page's primary content (e.g., the content within the `<main>` or `<article>` tag, or the entire visible body text as a last resort).
2. **Action Handling**:
    - When a user clicks an option in the dropdown, the content script will send a message to the background script containing:
        - The action type (e.g., 'openInChatGPT').
        - The current page URL (`window.location.href`).
        - The selected text (or page content).
3. **URL Construction (in `background.js`)**:
    - The background script will receive the message and construct the destination URL based on the action type.
    - **Prompt Template**: A base prompt will be used: `Analyze the following content from the webpage [Page URL]. The selected text is: [Selected Text].`
    - **ChatGPT**:
        - **URL**: `https://chat.openai.com/?q=[encoded_prompt]`
    - **Grok (x.ai)**:
        - **URL**: `https://grok.x.ai/?q=[encoded_prompt]`
    - **Cursor**:
        - **URL Scheme**: `cursor://open?url=[encoded_page_url]&selection=[encoded_selection]`
        - *Note: This assumes Cursor supports a URL scheme. If not, this will default to copying the information to the clipboard with instructions.*
    - **Cloud Code**:
        - *This will be a configurable feature. Initially, it will copy the content to the clipboard in a JSON format.*
        - **Clipboard Content**:
            
            ```
            {
              "source_url": "[Page URL]",
              "selected_text": "[Selected Text]",
              "timestamp": "[ISO 8601 Timestamp]"
            }
            
            ```
            
4. **Tab Creation**: The background script will open the newly constructed URL in a new browser tab using `chrome.tabs.create()`.

### 3.2. Feature 2: Conversation Exporter

### 3.2.1. UI/UX

- A "Copy Conversation" button will be injected into the UI of supported chat platforms.
- **Target Platforms & Button Placement**:
    - **ChatGPT**: The button will be placed near the "Regenerate response" button area.
- On click, the button will show a temporary "Copied!" state for 2 seconds.

### 3.2.2. Logic

1. **Platform Detection**: The content script will check `window.location.hostname` to determine if it's on a supported chat platform (e.g., `chat.openai.com`).
2. **DOM Scraping**:
    - When the "Copy Conversation" button is clicked, the script will query the DOM to find all elements that represent a turn in the conversation.
    - It will identify the elements corresponding to the user's prompts and the AI's responses based on their unique class names or data attributes.
3. **Content Formatting**:
    - The script will iterate through the conversation turns in chronological order.
    - It will build a single string, formatted for clarity:
        
        ```
        Conversation from: [Page URL]
        Exported on: [Date and Time]
        
        ---
        
        **User:**
        [Content of the first user prompt]
        
        ---
        
        **Assistant:**
        [Content of the first AI response]
        
        ---
        
        **User:**
        [Content of the second user prompt]
        
        ---
        ...and so on.
        
        ```
        
4. **Clipboard Access**:
    - The formatted string will be written to the user's clipboard using the `navigator.clipboard.writeText()` API. A success message will be logged to the console, and the button UI will update.

## 4. Technical Requirements

### 4.1. `manifest.json`

```
{
  "manifest_version": 3,
  "name": "AI Context Bridge",
  "version": "1.0",
  "description": "Send page context to AI tools and export chat conversations.",
  "permissions": [
    "activeTab",
    "scripting",
    "storage",
to-do   "clipboardWrite"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content_global.js"],
      "css": ["styles.css"]
    },
    {
      "matches": ["*://chat.openai.com/*"],
      "js": ["content_chatgpt.js"],
      "css": ["styles_chat.css"]
    }
  ],
  "action": {
    "default_title": "AI Context Bridge"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}

```

### 4.2. Technologies

- **HTML5**
- **CSS3** (including Shadow DOM for encapsulation)
- **JavaScript (ES6+)**
- **Chrome Extension APIs** (Manifest V3)

### 4.3. Security

- The `clipboardWrite` permission will only be requested when the user actively clicks the "Copy Conversation" or "Open in Cloud Code" button.
- All DOM manipulation will be carefully scoped to avoid interfering with the host page's functionality.
- No user data will be stored or transmitted by the extension, other than to construct the URLs as requested by the user's actions.