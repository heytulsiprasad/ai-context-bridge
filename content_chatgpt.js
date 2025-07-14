// ChatGPT-specific content script for AI Context Bridge extension
// Handles conversation export functionality on chat.openai.com

(function() {
  'use strict';
  
  // Wait for UI to be fully loaded
  function waitForUIReady() {
    const observer = new MutationObserver((mutations, obs) => {
      // Look for the main chat container
      const chatContainer = document.querySelector('[data-testid="conversation-turn-0"]') || 
                           document.querySelector('main') ||
                           document.querySelector('[role="main"]');
      
      if (chatContainer) {
        obs.disconnect();
        injectCopyButton();
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also try immediately in case the UI is already loaded
    setTimeout(() => {
      if (document.querySelector('[data-testid="conversation-turn-0"]') || 
          document.querySelector('main') ||
          document.querySelector('[role="main"]')) {
        injectCopyButton();
      }
    }, 2000);
  }
  
  function injectCopyButton() {
    // Avoid duplicate buttons
    if (document.getElementById('ai-context-bridge-copy-btn')) {
      return;
    }
    
    // Create copy button
    const copyButton = document.createElement('button');
    copyButton.id = 'ai-context-bridge-copy-btn';
    copyButton.textContent = 'Copy Conversation';
    copyButton.className = 'copy-conversation-btn';
    
    // Add event listener
    copyButton.addEventListener('click', () => {
      copyConversation(copyButton);
    });
    
    // Find a suitable location to inject the button
    const headerArea = document.querySelector('header') || 
                      document.querySelector('nav') ||
                      document.querySelector('.sticky') ||
                      document.body;
    
    // Create container for the button
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
    `;
    buttonContainer.appendChild(copyButton);
    
    document.body.appendChild(buttonContainer);
    
    // Load styles
    const style = document.createElement('style');
    style.textContent = `
      .copy-conversation-btn {
        background: #10a37f;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: background-color 0.2s ease;
      }
      
      .copy-conversation-btn:hover {
        background: #0f9068;
      }
      
      .copy-conversation-btn:active {
        transform: scale(0.98);
      }
    `;
    document.head.appendChild(style);
  }
  
  function copyConversation(button) {
    try {
      // Find all conversation turns
      const conversationTurns = document.querySelectorAll('[data-testid*="conversation-turn"]');
      const messages = [];
      
      conversationTurns.forEach(turn => {
        // Try different selectors for user and assistant messages
        const userMessage = turn.querySelector('[data-message-author-role="user"]') || 
                           turn.querySelector('.whitespace-pre-wrap');
        const assistantMessage = turn.querySelector('[data-message-author-role="assistant"]') || 
                                turn.querySelector('.markdown');
        
        if (userMessage) {
          const text = userMessage.textContent.trim();
          if (text) {
            messages.push(`User: ${text}`);
          }
        }
        
        if (assistantMessage) {
          const text = assistantMessage.textContent.trim();
          if (text) {
            messages.push(`Assistant: ${text}`);
          }
        }
      });
      
      // If the above doesn't work, try alternative selectors
      if (messages.length === 0) {
        const allMessages = document.querySelectorAll('[class*="group"], [class*="message"]');
        allMessages.forEach(msg => {
          const text = msg.textContent.trim();
          if (text && text.length > 20) { // Filter out short UI elements
            // Simple heuristic to determine if it's a user or assistant message
            const isUser = msg.closest('[data-message-author-role="user"]') || 
                          msg.textContent.includes('User:') ||
                          msg.querySelector('button[aria-label*="Copy"]') === null;
            
            const prefix = isUser ? 'User: ' : 'Assistant: ';
            messages.push(prefix + text);
          }
        });
      }
      
      const formattedConversation = messages.join('\n\n');
      
      // Copy to clipboard
      navigator.clipboard.writeText(formattedConversation).then(() => {
        // Show feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.style.background = '#059669';
        
        setTimeout(() => {
          button.textContent = originalText;
          button.style.background = '#10a37f';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        button.textContent = 'Copy Failed';
        button.style.background = '#dc2626';
        
        setTimeout(() => {
          button.textContent = 'Copy Conversation';
          button.style.background = '#10a37f';
        }, 2000);
      });
      
    } catch (error) {
      console.error('Error copying conversation:', error);
    }
  }
  
  // Start the process
  waitForUIReady();
})();