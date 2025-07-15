// Background script for AI Context Bridge extension
// Handles communication from content scripts and opens new tabs with AI services

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  const { action, url, selectedText, conversation, fromPlatform } = message;
  
  // Handle different actions
  switch (action) {
    case 'openInClaude':
    case 'openInChatGPT':
    case 'openInGemini':
    case 'openInGrok':
      handleAIService(action, url, selectedText);
      break;
    case 'continueInGemini':
    case 'continueInChatGPT':
      handleContinueConversation(action, conversation, fromPlatform);
      break;
    case 'openSettings':
      handleOpenSettings();
      break;
  }
});

function handleAIService(action, url, selectedText) {
  let destinationUrl;
  const content = selectedText || 'No content selected';
  
  if (action === 'openInClaude') {
    // Claude uses a specific URL format for pre-filled prompts
    const prompt = `Read from ${url} so I can ask questions about it. The selected content is: ${content}`;
    const encodedPrompt = encodeURIComponent(prompt);
    destinationUrl = `https://claude.ai/new?q=${encodedPrompt}`;
  } else if (action === 'openInChatGPT') {
    const prompt = `Analyze the following content from the webpage ${url}. The selected text is: ${content}`;
    const encodedPrompt = encodeURIComponent(prompt);
    destinationUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
  } else if (action === 'openInGemini') {
    // Gemini doesn't support pre-filled prompts via URL, so we'll copy to clipboard
    const prompt = `Analyze the following content from the webpage ${url}. The selected text is: ${content}`;
    copyToClipboard(prompt);
    destinationUrl = `https://gemini.google.com/app`;
  } else if (action === 'openInGrok') {
    const prompt = `Analyze the following content from the webpage ${url}. The selected text is: ${content}`;
    const encodedPrompt = encodeURIComponent(prompt);
    // Grok is integrated into X/Twitter
    destinationUrl = `https://x.com/i/grok?text=${encodedPrompt}`;
  }
  
  chrome.tabs.create({ url: destinationUrl });
}

function handleContinueConversation(action, conversation, fromPlatform) {
  let destinationUrl;
  const prompt = `Continue this conversation from ${fromPlatform}:\n\n${conversation}`;
  
  if (action === 'continueInGemini') {
    // Gemini doesn't support pre-filled prompts via URL, so we'll copy to clipboard
    copyToClipboard(prompt);
    destinationUrl = `https://gemini.google.com/app`;
  } else if (action === 'continueInChatGPT') {
    const encodedPrompt = encodeURIComponent(prompt);
    destinationUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
  }
  
  chrome.tabs.create({ url: destinationUrl });
}

function handleOpenSettings() {
  // Create a settings page
  chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
}

// Helper function to copy text to clipboard
function copyToClipboard(text) {
  // Create a textarea element to hold the text
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (textToCopy) => {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          
          // Show a brief notification
          const notification = document.createElement('div');
          notification.textContent = 'Prompt copied to clipboard! Paste it in Gemini.';
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #667eea;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          `;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 3000);
        },
        args: [text]
      });
    }
  });
}