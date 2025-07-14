# Project Checklist: AI Context Bridge

This checklist breaks down the development of the "AI Context Bridge" Chrome extension into actionable steps, following the phased approach outlined in the development blueprint.

## **Phase 1: Core Setup & Floating Button UI**

*Goal: Establish the basic extension structure and get the primary user interface element working on all pages.*

### Step 1.1: Initial Project Setup

- [ ]  Create `manifest.json` file.
- [ ]  Configure `manifest.json` with `manifest_version`, `name`, `version`, and `description`.
- [ ]  Add `activeTab`, `scripting`, and `storage` to `permissions` in `manifest.json`.
- [ ]  Define the `background` service worker in `manifest.json`.
- [ ]  Define the `content_scripts` for `<all_urls>` (`content_global.js`) in `manifest.json`.
- [ ]  Define the `content_scripts` for `://chat.openai.com/*` (`content_chatgpt.js`) in `manifest.json`.
- [ ]  Create `background.js` with a descriptive comment header.
- [ ]  Create `content_global.js` with a descriptive comment header.
- [ ]  Create `content_chatgpt.js` with a descriptive comment header.
- [ ]  Create empty `styles.css` and `styles_chat.css` files.
- [ ]  Create an `icons` directory.
- [ ]  Add `icon16.png`, `icon48.png`, and `icon128.png` to the `icons` directory.
- [ ]  Link icons in `manifest.json`.

### Step 1.2 & 1.3: Inject and Style the Floating Button

- [ ]  In `content_global.js`, create a main container element for the UI.
- [ ]  Attach a Shadow DOM to the container element.
- [ ]  Create the floating action button element.
- [ ]  Append the button to the Shadow DOM.
- [ ]  Inject the main container into the `document.body`.
- [ ]  In `styles.css`, define styles for the floating button (position, size, color, shadow, etc.).
- [ ]  In `content_global.js`, write a function to fetch the content of `styles.css` and inject it into the Shadow DOM via a `<style>` tag.
- [ ]  Add an SVG icon to the button (e.g., as a data URL).

### Step 1.4: Implement Dropdown Menu

- [ ]  In `content_global.js`, create the HTML element for the dropdown menu.
- [ ]  Add list items for "Open in ChatGPT", "Open in Grok", "Open in Cursor", and "Open in Cloud Code".
- [ ]  Append the menu to the Shadow DOM.
- [ ]  In `styles.css`, add styles to hide the menu by default (`display: none` or `visibility: hidden`).
- [ ]  In `styles.css`, add styles for the menu's appearance (background, padding, border-radius) and for its items (hover effects, spacing).
- [ ]  In `content_global.js`, add a click event listener to the floating button to toggle a class (e.g., `.visible`) on the menu element.
- [ ]  In `content_global.js`, add a `window` click event listener to check for clicks outside the main UI container and hide the menu if necessary.

## **Phase 2: "Open In" Functionality**

*Goal: Wire up the dropdown menu to capture page context and open new tabs with pre-filled prompts.*

### Step 2.1 & 2.2: Context Detection and Communication

- [ ]  In `content_global.js`, declare a variable to store the last selected text.
- [ ]  Add a `mouseup` event listener to the `document` to update the selected text variable.
- [ ]  Add click event listeners to each item in the dropdown menu.
- [ ]  In the menu item click handlers, call `chrome.runtime.sendMessage`.
- [ ]  Pass an object with `action`, `url`, and `selectedText` to the message.
- [ ]  In `background.js`, implement the `chrome.runtime.onMessage` listener.
- [ ]  Inside the listener, log the received message to the console for initial testing.

### Step 2.3, 2.4 & 2.5: Implement Background Logic & Fallback

- [ ]  In `background.js`, create a handler function that takes the message object.
- [ ]  Use a `switch` statement inside the handler to process the `action` property.
- [ ]  **Case 'openInChatGPT'**:
    - [ ]  Define the prompt template.
    - [ ]  Check if `selectedText` is empty.
    - [ ]  If `selectedText` is empty, send a message back to `content_global.js` to request page content.
    - [ ]  In `content_global.js`, add a listener to get page content (e.g., from `<main>` or `<body>`) and send it back.
    - [ ]  Once content is available, URL-encode the final prompt.
    - [ ]  Construct the full `https://chat.openai.com/?q=` URL.
    - [ ]  Call `chrome.tabs.create` with the new URL.
- [ ]  **Case 'openInGrok'**:
    - [ ]  Repeat the process for Grok's URL structure (`https://grok.x.ai/?q=...`).
- [ ]  **Case 'openInCursor'**:
    - [ ]  Log a "Not yet implemented" message to the console.
- [ ]  **Case 'openInCloudCode'**:
    - [ ]  Log a "Not yet implemented" message to the console.

## **Phase 3: Conversation Exporter & Final Wiring**

*Goal: Implement the chat scraping feature and complete all clipboard functionality.*

### Step 3.1 & 3.2: Setup and Inject "Copy" Button

- [ ]  In `content_chatgpt.js`, create a function to inject the "Copy Conversation" button.
- [ ]  Use a `MutationObserver` to monitor the DOM for the target element where the button should be injected.
- [ ]  Once the target element appears, append the custom button.
- [ ]  In `styles_chat.css`, add styles to make the button blend in with the ChatGPT UI.
- [ ]  Load `styles_chat.css` and inject it into the page.
- [ ]  Add a click listener to the new button that logs to the console for initial testing.

### Step 3.3 & 3.4: Implement Scraping and Clipboard

- [ ]  In the button's click handler in `content_chatgpt.js`:
    - [ ]  Identify the correct and stable DOM selectors for user and assistant messages.
    - [ ]  Use `document.querySelectorAll` to grab all message elements.
    - [ ]  Iterate through the NodeList, identifying the role (user/assistant) for each.
    - [ ]  Build the formatted string as specified in the technical spec.
    - [ ]  Add `clipboardWrite` to the `permissions` in `manifest.json`.
    - [ ]  Use `navigator.clipboard.writeText()` to copy the formatted string.
    - [ ]  Implement user feedback (e.g., change button text to "Copied!").

### Final Wiring

- [ ]  In `background.js`, implement the 'openInCursor' case to copy content to the clipboard using the specified fallback format.
- [ ]  In `background.js`, implement the 'openInCloudCode' case to copy content to the clipboard using the specified JSON format.
- [ ]  Perform end-to-end testing of all features on multiple websites.
- [ ]  Review all code for best practices and remove temporary console logs.