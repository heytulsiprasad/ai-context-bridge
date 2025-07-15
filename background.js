// Background script for AI Context Bridge extension
// Handles communication from content scripts and opens new tabs with AI services

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  const { action, url, selectedText, conversation, fromPlatform } = message;
  
  // Handle different actions
  switch (action) {
    case 'openInClaude':
    case 'openInChatGPT':
    case 'openInGrok':
      handleAIService(action, url, selectedText);
      break;
  }
});

function handleAIService(action, url, selectedText) {
  let destinationUrl;
  const prompt = `Read from ${url} so I can ask questions about it.`;
  
  if (action === 'openInClaude') {
    const encodedPrompt = encodeURIComponent(prompt);
    destinationUrl = `https://claude.ai/new?q=${encodedPrompt}`;
  } else if (action === 'openInChatGPT') {
    const encodedPrompt = encodeURIComponent(prompt);
    destinationUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
  } else if (action === 'openInGrok') {
    const encodedPrompt = encodeURIComponent(prompt);
    destinationUrl = `https://x.com/i/grok?text=${encodedPrompt}`;
  }
  
  chrome.tabs.create({ url: destinationUrl });
}

