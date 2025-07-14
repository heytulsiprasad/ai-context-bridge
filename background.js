// Background script for AI Context Bridge extension
// Handles communication from content scripts and opens new tabs with AI services

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  const { action, url, selectedText } = message;
  
  // Handle different actions
  switch (action) {
    case 'openInChatGPT':
    case 'openInGrok':
      handleAIService(action, url, selectedText);
      break;
    case 'openInCursor':
    case 'openInCloudCode':
      handleClipboardAction(action, url, selectedText);
      break;
  }
});

function handleAIService(action, url, selectedText) {
  const basePrompt = `Analyze the following content from the webpage ${url}. The selected text is: ${selectedText}.`;
  const encodedPrompt = encodeURIComponent(basePrompt);
  
  let destinationUrl;
  
  if (action === 'openInChatGPT') {
    destinationUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
  } else if (action === 'openInGrok') {
    destinationUrl = `https://x.com/i/grok?q=${encodedPrompt}`;
  }
  
  chrome.tabs.create({ url: destinationUrl });
}

function handleClipboardAction(action, url, selectedText) {
  let clipboardContent;
  
  if (action === 'openInCursor') {
    clipboardContent = `Context from ${url}:\n\n${selectedText}`;
  } else if (action === 'openInCloudCode') {
    clipboardContent = `// Context from ${url}\n// Selected text: ${selectedText}\n\n`;
  }
  
  // Copy to clipboard using the clipboard API
  navigator.clipboard.writeText(clipboardContent).then(() => {
    console.log(`Content copied to clipboard for ${action}`);
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err);
  });
}