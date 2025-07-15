// Global content script for AI Context Bridge extension
// Injects minimal drawer UI on all webpages

(function() {
  'use strict';
  
  // Check if extension is enabled on this site
  chrome.storage.sync.get(['excludedSites', 'extensionEnabled'], (data) => {
    const excludedSites = data.excludedSites || [];
    const extensionEnabled = data.extensionEnabled !== false; // Default to true
    
    if (!extensionEnabled) return;
    
    // Check if current site is excluded
    const currentUrl = window.location.href;
    for (const pattern of excludedSites) {
      try {
        const regex = new RegExp(pattern);
        if (regex.test(currentUrl)) {
          return; // Don't load on excluded sites
        }
      } catch (e) {
        console.error('Invalid regex pattern:', pattern);
      }
    }
    
    initializeExtension();
  });
  
  function initializeExtension() {
    // Store selected text
    let selectedText = '';
    
    // Listen for text selection
    document.addEventListener('mouseup', () => {
      selectedText = window.getSelection().toString().trim();
    });
    
    // Create shadow DOM container
    const container = document.createElement('div');
    container.id = 'ai-context-bridge-container';
    const shadowRoot = container.attachShadow({ mode: 'closed' });
    
    // Create drawer UI
    const drawer = document.createElement('div');
    drawer.id = 'ai-context-drawer';
    drawer.innerHTML = `
      <div class="drawer-tab">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
        </svg>
      </div>
      <div class="drawer-content">
        <div class="drawer-section">
          <div class="menu-item" data-action="openInClaude">
            <img src="" data-icon="robot" alt="Claude" />
            <span>Open in Claude</span>
          </div>
          <div class="menu-item" data-action="openInChatGPT">
            <img src="" data-icon="chatgpt" alt="ChatGPT" />
            <span>Open in ChatGPT</span>
          </div>
          <div class="menu-item" data-action="openInGemini">
            <img src="" data-icon="gemini" alt="Gemini" />
            <span>Open in Gemini</span>
          </div>
          <div class="menu-item" data-action="openInGrok">
            <img src="" data-icon="grok" alt="Grok" />
            <span>Open in Grok</span>
          </div>
        </div>
        <div class="drawer-divider"></div>
        <div class="drawer-section">
          <div class="section-header">Continue Conversation</div>
          <div class="menu-item" data-action="continueInGemini">
            <img src="" data-icon="arrow" alt="Continue" />
            <span>Continue in Gemini</span>
          </div>
          <div class="menu-item" data-action="continueInChatGPT">
            <img src="" data-icon="arrow" alt="Continue" />
            <span>Continue in ChatGPT</span>
          </div>
        </div>
      </div>
    `;
    
    // Create settings button
    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'ai-context-settings-btn';
    settingsBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z" stroke="currentColor" stroke-width="1.5"/>
        <path d="M20.5 12C20.5 11.5 20.5 11 20.4 10.6L22.3 9.1C22.5 8.9 22.5 8.6 22.4 8.3L20.6 5.1C20.5 4.9 20.2 4.8 19.9 4.9L17.6 5.8C17.1 5.4 16.6 5.1 16 4.8L15.6 2.4C15.6 2.1 15.3 1.9 15 1.9H11.5C11.2 1.9 10.9 2.1 10.9 2.4L10.5 4.8C9.9 5.1 9.4 5.4 8.9 5.8L6.6 4.9C6.3 4.8 6 4.9 5.9 5.1L4.1 8.3C4 8.5 4 8.8 4.2 9L6.1 10.5C6 10.9 6 11.4 6 11.9C6 12.4 6 12.9 6.1 13.3L4.2 14.8C4 15 4 15.3 4.1 15.6L5.9 18.8C6 19 6.3 19.1 6.6 19L8.9 18.1C9.4 18.5 9.9 18.8 10.5 19.1L10.9 21.5C10.9 21.8 11.2 22 11.5 22H15C15.3 22 15.6 21.8 15.6 21.5L16 19.1C16.6 18.8 17.1 18.5 17.6 18.1L19.9 19C20.2 19.1 20.5 19 20.6 18.8L22.4 15.6C22.5 15.4 22.5 15.1 22.3 14.9L20.4 13.4C20.5 13 20.5 12.5 20.5 12Z" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    `;
    
    // Load and inject styles
    const style = document.createElement('style');
    fetch(chrome.runtime.getURL('styles.css'))
      .then(response => response.text())
      .then(css => {
        style.textContent = css;
        shadowRoot.appendChild(style);
        
        // Load icon images
        loadIcons(shadowRoot);
      });
    
    // Drawer hover behavior
    let hoverTimer;
    drawer.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimer);
      drawer.classList.add('expanded');
    });
    
    drawer.addEventListener('mouseleave', () => {
      hoverTimer = setTimeout(() => {
        drawer.classList.remove('expanded');
      }, 300);
    });
    
    // Settings button click
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openSettings' });
    });
    
    // Function to extract page content if no text is selected
    function extractPageContent() {
      const mainContent = document.querySelector('main') || 
                         document.querySelector('article') ||
                         document.querySelector('[role="main"]') ||
                         document.querySelector('.content') ||
                         document.body;
      
      const clonedContent = mainContent.cloneNode(true);
      const elementsToRemove = clonedContent.querySelectorAll('script, style, nav, header, footer, aside, .nav, .menu, .sidebar');
      elementsToRemove.forEach(el => el.remove());
      
      return clonedContent.textContent.trim().substring(0, 2000);
    }
    
    // Handle menu item clicks
    drawer.addEventListener('click', (e) => {
      const menuItem = e.target.closest('.menu-item');
      if (menuItem) {
        e.preventDefault();
        const action = menuItem.dataset.action;
        
        // For continue actions, we need to get the full conversation
        if (action.startsWith('continue')) {
          handleContinueAction(action);
        } else {
          // Use selected text if available, otherwise extract page content
          const contentToSend = selectedText || extractPageContent();
          
          chrome.runtime.sendMessage({
            action: action,
            url: window.location.href,
            selectedText: contentToSend
          });
        }
      }
    });
    
    // Handle continue conversation actions
    function handleContinueAction(action) {
      // This will be implemented based on the current site
      const currentUrl = window.location.href;
      
      if (currentUrl.includes('chat.openai.com') || currentUrl.includes('chatgpt.com')) {
        extractChatGPTConversation((conversation) => {
          chrome.runtime.sendMessage({
            action: action,
            conversation: conversation,
            fromPlatform: 'chatgpt'
          });
        });
      } else if (currentUrl.includes('gemini.google.com')) {
        extractGeminiConversation((conversation) => {
          chrome.runtime.sendMessage({
            action: action,
            conversation: conversation,
            fromPlatform: 'gemini'
          });
        });
      } else if (currentUrl.includes('claude.ai')) {
        extractClaudeConversation((conversation) => {
          chrome.runtime.sendMessage({
            action: action,
            conversation: conversation,
            fromPlatform: 'claude'
          });
        });
      } else {
        alert('Continue conversation is only available on ChatGPT, Gemini, or Claude pages.');
      }
    }
    
    // Append elements to shadow DOM
    shadowRoot.appendChild(drawer);
    shadowRoot.appendChild(settingsBtn);
    
    // Append container to body
    document.body.appendChild(container);
  }
  
  // Function to load icon images
  function loadIcons(shadowRoot) {
    const iconMap = {
      'robot': 'https://img.icons8.com/color/24/ai-robot.png',
      'chatgpt': 'https://img.icons8.com/color/24/chatgpt.png',
      'gemini': 'https://img.icons8.com/color/24/gemini-ai.png',
      'grok': 'https://img.icons8.com/color/24/ai-robot--v2.png',
      'arrow': 'https://img.icons8.com/color/24/circled-right-2.png'
    };
    
    shadowRoot.querySelectorAll('img[data-icon]').forEach(img => {
      const iconKey = img.getAttribute('data-icon');
      if (iconMap[iconKey]) {
        img.src = iconMap[iconKey];
      }
    });
  }
  
  // Conversation extraction functions
  function extractChatGPTConversation(callback) {
    // Scroll to top first
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      const messages = [];
      
      // Try multiple selectors for ChatGPT conversation turns
      const selectors = [
        '[data-testid*="conversation-turn"]',
        '.group.w-full',
        '[class*="group"][class*="text-token"]',
        '.flex.flex-col.text-sm'
      ];
      
      let conversationElements = null;
      for (const selector of selectors) {
        conversationElements = document.querySelectorAll(selector);
        if (conversationElements.length > 0) break;
      }
      
      if (conversationElements) {
        conversationElements.forEach(element => {
          // Check if it's a user message
          const isUser = element.querySelector('[data-message-author-role="user"]') ||
                        element.textContent.includes('You') ||
                        element.querySelector('.dark\\:bg-gray-800') ||
                        element.classList.contains('dark:bg-gray-800');
          
          // Extract text content
          const textElements = element.querySelectorAll('.whitespace-pre-wrap, .markdown, p, [class*="prose"]');
          let text = '';
          
          if (textElements.length > 0) {
            text = Array.from(textElements).map(el => el.textContent.trim()).join('\n');
          } else {
            text = element.textContent.trim();
          }
          
          if (text && text.length > 10) {
            const role = isUser ? 'User' : 'Assistant';
            messages.push(`${role}: ${text}`);
          }
        });
      }
      
      // Format as markdown
      const conversation = messages.join('\n\n---\n\n');
      callback(conversation || 'No conversation found. Make sure you are on a ChatGPT conversation page.');
    }, 1000); // Wait for scroll
  }
  
  function extractGeminiConversation(callback) {
    // Scroll to top first
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      const messages = [];
      
      // Try multiple selectors for Gemini conversation
      const selectors = [
        '[data-test-id="conversation-turn"]',
        '.conversation-turn',
        '[class*="message-content"]',
        '.model-response-text, .user-query-text'
      ];
      
      let conversationElements = null;
      for (const selector of selectors) {
        conversationElements = document.querySelectorAll(selector);
        if (conversationElements.length > 0) break;
      }
      
      if (conversationElements) {
        conversationElements.forEach((element, index) => {
          const text = element.textContent.trim();
          if (text && text.length > 10) {
            // Alternate between user and assistant
            const role = index % 2 === 0 ? 'User' : 'Assistant';
            messages.push(`${role}: ${text}`);
          }
        });
      }
      
      // Format as markdown
      const conversation = messages.join('\n\n---\n\n');
      callback(conversation || 'No conversation found. Make sure you are on a Gemini conversation page.');
    }, 1000); // Wait for scroll
  }
  
  function extractClaudeConversation(callback) {
    // Scroll to top first
    window.scrollTo(0, 0);
    
    setTimeout(() => {
      const messages = [];
      
      // Try multiple selectors for Claude conversation
      const selectors = [
        '[data-testid*="conversation"]',
        '.prose',
        '[class*="message"]',
        '.conversation-turn'
      ];
      
      let conversationElements = null;
      for (const selector of selectors) {
        conversationElements = document.querySelectorAll(selector);
        if (conversationElements.length > 0) break;
      }
      
      if (conversationElements) {
        conversationElements.forEach((element, index) => {
          const text = element.textContent.trim();
          if (text && text.length > 10) {
            // Try to determine role from class or content
            const isUser = element.classList.contains('user') ||
                          element.querySelector('[class*="user"]') ||
                          index % 2 === 0;
            
            const role = isUser ? 'User' : 'Assistant';
            messages.push(`${role}: ${text}`);
          }
        });
      }
      
      // Format as markdown
      const conversation = messages.join('\n\n---\n\n');
      callback(conversation || 'No conversation found. Make sure you are on a Claude conversation page.');
    }, 1000); // Wait for scroll
  }
})();