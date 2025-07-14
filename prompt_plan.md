# Development Blueprint & LLM Prompts: AI Context Bridge

This document outlines a phased, step-by-step implementation plan for the AI Context Bridge Chrome extension. It is followed by a series of precise prompts designed to be fed to a code-generation LLM for a test-driven, incremental build process.

## Part 1: The Development Blueprint

The project is broken down into three main phases:

1. **Phase 1: Core Setup & Floating Button UI**. Establish the basic extension structure and get the primary user interface element working on all pages.
2. **Phase 2: "Open In" Functionality**. Implement the core logic for sending page context to external AI services.
3. **Phase 3: Conversation Exporter**. Build the specialized feature for scraping and copying chat histories.

### **Phase 1: Core Setup & Floating Button UI**

- **Goal:** Create a functional extension that injects a visible, styled, and interactive floating button and dropdown menu onto any webpage.
- **Testing Focus:** Visual confirmation, basic interactivity (clicks, hovers), and absence of console errors on various websites.

| Step | Description | Key Components |
| --- | --- | --- |
| **1.1** | **Initial Project Setup**: Create the `manifest.json` file, basic icons, and an empty `background.js` and `content_global.js`. | `manifest.json`, `icons/`, `background.js`, `content_global.js` |
| **1.2** | **Inject a Simple Floating Button**: Modify `content_global.js` to inject a basic, unstyled button into the body of every webpage. | `content_global.js` |
| **1.3** | **Style the Button & Use Shadow DOM**: Style the button and encapsulate it and its future menu within a Shadow DOM to prevent CSS conflicts. | `content_global.js`, `styles.css` |
| **1.4** | **Implement Dropdown Menu**: Create the HTML for the dropdown menu. Make it appear when the button is clicked and hide when clicked outside. | `content_global.js`, `styles.css` |

### **Phase 2: "Open In" Functionality**

- **Goal:** Wire up the dropdown menu to capture page context and open new tabs with pre-filled prompts for ChatGPT and Grok.
- **Testing Focus:** Correct context capture (selected vs. page text), proper URL encoding, and successful opening of new tabs with the correct data.

| Step | Description | Key Components |
| --- | --- | --- |
| **2.1** | **Listen for Text Selection**: In `content_global.js`, add an event listener to capture and store any text the user selects on the page. | `content_global.js` |
| **2.2** | **Establish Communication**: Set up message passing from the content script (`content_global.js`) to the background script (`background.js`). | `content_global.js`, `background.js` |
| **2.3** | **Implement Background Logic (ChatGPT)**: In `background.js`, handle the message for "Open in ChatGPT", construct the URL, and open a new tab. | `background.js` |
| **2.4** | **Implement Background Logic (All Services)**: Extend `background.js` to handle Grok, Cursor, and Cloud Code actions with their respective URL schemes or clipboard actions. | `background.js` |
| **2.5** | **Fallback Content Extraction**: Implement the logic in `content_global.js` to extract the main page content if no text is selected. | `content_global.js` |

### **Phase 3: Conversation Exporter**

- **Goal:** Implement the feature to inject a "Copy Conversation" button into ChatGPT's UI and have it correctly scrape and format the chat history.
- **Testing Focus:** Correct button injection on the target site, accurate scraping of all user/assistant turns, and correct formatting of the output on the clipboard.

| Step | Description | Key Components |
| --- | --- | --- |
| **3.1** | **Setup Chat-Specific Scripts**: Create `content_chatgpt.js` and update the manifest to inject it only on `chat.openai.com`. | `manifest.json`, `content_chatgpt.js` |
| **3.2** | **Inject the "Copy" Button**: In `content_chatgpt.js`, write the logic to find the correct spot in the ChatGPT UI and inject the custom button. | `content_chatgpt.js`, `styles_chat.css` |
| **3.3** | **Implement DOM Scraping Logic**: Write the function that identifies and extracts the text from all user and assistant message bubbles. | `content_chatgpt.js` |
| **3.4** | **Format and Copy to Clipboard**: Write the logic to format the scraped text into the specified string format and copy it to the clipboard. | `content_chatgpt.js` |

## Part 2: Prompts for Code-Generation LLM

Below are the sequential prompts to generate the code for this extension. Each prompt builds on the last.

### **Prompt 1: Initial Project Setup**

```
Based on the provided technical specification for the "AI Context Bridge" Chrome extension, create the initial file structure.

Generate the following files:
1.  `manifest.json`: Fully configured according to the spec, including permissions for `activeTab`, `scripting`, and `storage`. Define the content scripts for `<all_urls>` and `*://chat.openai.com/*`.
2.  `background.js`: An empty file with a comment header explaining its purpose.
3.  `content_global.js`: An empty file with a comment header explaining its purpose.
4.  `content_chatgpt.js`: An empty file with a comment header explaining its purpose.
5.  `styles.css`: An empty file.
6.  `styles_chat.css`: An empty file.

Also, specify that I need a directory named `icons` containing three placeholder icons: `icon16.png`, `icon48.png`, and `icon128.png`.

```

### **Prompt 2: Inject and Style the Floating Button**

```
Using the files from the previous step, modify `content_global.js` and `styles.css`.

Your task is to:
1.  In `content_global.js`, write the code to create a floating action button and inject it into the `document.body` of every webpage.
2.  **Crucially**, the entire UI (the button and its future menu) must be encapsulated within a Shadow DOM to prevent any style conflicts with the host page.
3.  In `styles.css`, add the necessary CSS to style the floating button. It should be a circle, fixed to the bottom-right corner of the viewport, with a distinct color (e.g., a blue gradient), a subtle box-shadow, and a simple icon (you can use an SVG data URL for a placeholder icon, like a simple plus sign or a spark).
4.  The CSS from `styles.css` should be injected into the Shadow DOM.

```

### **Prompt 3: Implement the Dropdown Menu**

```
Building on the existing `content_global.js` and `styles.css`, add the dropdown menu functionality.

1.  In `content_global.js`, create the HTML structure for a dropdown menu containing the four options specified in the technical spec: "Open in ChatGPT", "Open in Grok", "Open in Cursor", and "Open in Cloud Code".
2.  This menu should be hidden by default and should be appended inside the same Shadow DOM as the button.
3.  Add an event listener to the floating button. When clicked, it should toggle the visibility of the dropdown menu.
4.  Add a global click listener to the `window` that checks if a click occurred outside of the floating button/menu container. If it did, the menu should be hidden.
5.  In `styles.css`, add styling for the dropdown menu. It should appear cleanly above the button, with a light background, rounded corners, and clear, well-spaced list items that have a hover effect.

```

### **Prompt 4: Context Detection and Communication**

```
Now, let's add the core context-gathering logic to `content_global.js` and set up communication with `background.js`.

1.  In `content_global.js`, add a `mouseup` event listener to the `document`. When triggered, it should get the currently selected text using `window.getSelection().toString().trim()` and store it in a variable.
2.  Modify the click event listeners on the dropdown menu items. When a menu item is clicked, it should:
    a. Prevent the default action.
    b. Determine which action was clicked (e.g., 'openInChatGPT').
    c. Send a message to the background script using `chrome.runtime.sendMessage`. The message should be an object containing: `{ action: 'openInChatGPT', url: window.location.href, selectedText: the_stored_selected_text }`.
3.  In `background.js`, add a listener using `chrome.runtime.onMessage.addListener` to receive these messages and log the received data to the console for now.

```

### **Prompt 5: Implement Background Logic**

```
Let's implement the core feature in `background.js`.

1.  Modify the `chrome.runtime.onMessage` listener in `background.js`.
2.  Create a function that takes the `action`, `url`, and `selectedText` from the message.
3.  This function should contain a `switch` statement for the `action`.
4.  For the cases 'openInChatGPT' and 'openInGrok', implement the following:
    a. Define the base prompt template: `Analyze the following content from the webpage ${url}. The selected text is: ${selectedText}.`
    b. URL-encode the prompt.
    c. Construct the final destination URL (e.g., `https://chat.openai.com/?q=...`).
    d. Use `chrome.tabs.create({ url: destinationUrl })` to open the link in a new tab.
5. For the 'openInCursor' and 'openInCloudCode' cases, for now, just log a message to the console saying "Action [action] triggered." We will implement clipboard logic later.

```

### **Prompt 6: Implement Conversation Exporter**

```
Let's switch focus to the conversation exporter.

1.  In `content_chatgpt.js`, write a function that uses a `MutationObserver` or a timed interval to wait for the ChatGPT UI to be fully loaded.
2.  Once the UI is ready, inject a "Copy Conversation" button into the appropriate area (e.g., near the regenerate button). Use `styles_chat.css` to make it look consistent with the site's UI.
3.  Add a click listener to this new button. For now, when clicked, it should just log "Copy button clicked" to the console.

```

### **Prompt 7: Final Wiring and Clipboard**

```
This is the final step to complete the core functionality.

1.  First, let's add the `clipboardWrite` permission to the `manifest.json` file.
2.  In `content_chatgpt.js`, implement the DOM scraping logic. When the "Copy Conversation" button is clicked:
    a. Select all DOM elements that contain the user prompts and assistant responses. You will need to identify the correct selectors for the ChatGPT interface.
    b. Iterate through them in order, building the formatted string as defined in the technical spec.
    c. Use `navigator.clipboard.writeText()` to copy the final string to the clipboard.
    d. Briefly change the button's text to "Copied!" for 2 seconds as user feedback.
3.  Finally, in `background.js`, implement the clipboard functionality for the "Open in Cloud Code" and "Open in Cursor" (as a fallback) actions. When these actions are triggered, format the data as specified in the spec and copy it to the clipboard.

```