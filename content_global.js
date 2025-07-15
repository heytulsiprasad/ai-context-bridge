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