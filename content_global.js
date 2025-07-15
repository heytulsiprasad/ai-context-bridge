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
        <img src="${chrome.runtime.getURL('icons/icon48.png')}" alt="AI Context Bridge" width="20" height="20" />
      </div>
      <div class="drawer-content">
        <div class="drawer-section">
          <div class="menu-item" data-action="openInClaude">
            <img src="" data-icon="robot" alt="Claude" />
            <span>Open in Claude</span>
            <img src="" data-icon="external" alt="External Link" class="external-icon" />
          </div>
          <div class="menu-item" data-action="openInChatGPT">
            <img src="" data-icon="chatgpt" alt="ChatGPT" />
            <span>Open in ChatGPT</span>
            <img src="" data-icon="external" alt="External Link" class="external-icon" />
          </div>
          <div class="menu-item" data-action="openInPerplexity">
            <img src="" data-icon="perplexity" alt="Perplexity" />
            <span>Open in Perplexity</span>
            <img src="" data-icon="external" alt="External Link" class="external-icon" />
          </div>
          <div class="menu-item" data-action="openInGrok">
            <img src="" data-icon="grok" alt="Grok" />
            <span>Open in Grok</span>
            <img src="" data-icon="external" alt="External Link" class="external-icon" />
          </div>
        </div>
        <div class="drawer-divider"></div>
        <div class="drawer-section">
          <div class="menu-item" data-action="copyAsMarkdown">
            <img src="" data-icon="copy" alt="Copy" />
            <span>Copy as Markdown</span>
          </div>
          <div class="menu-item youtube-only" data-action="copyYouTubeVideo" style="display: none;">
            <img src="" data-icon="youtube" alt="YouTube" />
            <span>Copy YouTube Video</span>
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
        
        // Show YouTube-specific options if on YouTube
        checkForYouTube(shadowRoot);
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
    
    // Make drawer draggable vertically
    let isDragging = false;
    let startY = 0;
    let startTop = 0;
    
    const drawerTab = drawer.querySelector('.drawer-tab');
    
    drawerTab.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startTop = drawer.offsetTop;
      drawerTab.style.cursor = 'grabbing';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaY = e.clientY - startY;
      const newTop = startTop + deltaY;
      
      // Constrain to viewport bounds
      const maxTop = window.innerHeight - drawer.offsetHeight;
      const constrainedTop = Math.max(0, Math.min(newTop, maxTop));
      
      drawer.style.top = constrainedTop + 'px';
      
      // Store position in chrome storage for all websites
      chrome.storage.sync.set({ drawerPosition: constrainedTop });
    });
    
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        drawerTab.style.cursor = 'grab';
      }
    });
    
    // Restore saved position from chrome storage
    chrome.storage.sync.get(['drawerPosition'], (data) => {
      if (data.drawerPosition !== undefined) {
        drawer.style.top = data.drawerPosition + 'px';
      }
    });
    
    // Set initial cursor
    drawerTab.style.cursor = 'grab';
    
    
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
        
        if (action === 'copyAsMarkdown') {
          handleCopyAsMarkdown();
        } else if (action === 'copyYouTubeVideo') {
          handleCopyYouTubeVideo();
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
    
    // Handle copy as markdown action
    function handleCopyAsMarkdown() {
      const url = window.location.href;
      const prompt = `Read from ${url} so I can ask questions about it.`;
      copyTextToClipboard(prompt);
      showNotification('URL prompt copied to clipboard!');
    }
    
    // Handle copy YouTube video action
    function handleCopyYouTubeVideo() {
      const url = window.location.href;
      const prompt = `Watch this video: ${url}`;
      copyTextToClipboard(prompt);
      showNotification('YouTube video prompt copied to clipboard!');
    }
    
    // Check if we're on YouTube and show YouTube-specific options
    function checkForYouTube(shadowRoot) {
      const currentUrl = window.location.href;
      if (currentUrl.includes('youtube.com/watch') || currentUrl.includes('youtu.be/')) {
        const youtubeItems = shadowRoot.querySelectorAll('.youtube-only');
        youtubeItems.forEach(item => {
          item.style.display = 'flex';
        });
      }
    }
    
    // Helper function to copy text to clipboard
    function copyTextToClipboard(text) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
    }
    
    // Helper function to show notification
    function showNotification(message) {
      const notification = document.createElement('div');
      notification.textContent = message;
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
    }
    
    // Append elements to shadow DOM
    shadowRoot.appendChild(drawer);
    
    // Append container to body
    document.body.appendChild(container);
  }
  
  // Function to load icon images
  function loadIcons(shadowRoot) {
    const iconMap = {
      'robot': chrome.runtime.getURL('icons/claude.png'),
      'chatgpt': chrome.runtime.getURL('icons/chatgpt.jpg'),
      'copy': 'https://img.icons8.com/color/24/copy.png',
      'grok': chrome.runtime.getURL('icons/grok.png'),
      'perplexity': 'https://img.icons8.com/color/24/search.png',
      'external': chrome.runtime.getURL('icons/ext-link.png'),
      'youtube': 'https://img.icons8.com/color/24/youtube-play.png',
      'arrow': 'https://img.icons8.com/color/24/circled-right-2.png'
    };
    
    shadowRoot.querySelectorAll('img[data-icon]').forEach(img => {
      const iconKey = img.getAttribute('data-icon');
      if (iconMap[iconKey]) {
        img.src = iconMap[iconKey];
      }
    });
  }
  
})();