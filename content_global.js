// Global content script for AI Context Bridge extension
// Injects floating button and dropdown menu on all webpages

(function() {
  'use strict';
  
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
  
  // Create floating button
  const floatingButton = document.createElement('button');
  floatingButton.id = 'ai-context-bridge-btn';
  floatingButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
    </svg>
  `;
  
  // Create dropdown menu
  const dropdownMenu = document.createElement('div');
  dropdownMenu.id = 'ai-context-bridge-menu';
  dropdownMenu.style.display = 'none';
  dropdownMenu.innerHTML = `
    <div class="menu-item" data-action="openInChatGPT">Open in ChatGPT</div>
    <div class="menu-item" data-action="openInGrok">Open in Grok</div>
    <div class="menu-item" data-action="openInCursor">Open in Cursor</div>
    <div class="menu-item" data-action="openInCloudCode">Open in Cloud Code</div>
  `;
  
  // Load and inject styles
  const style = document.createElement('style');
  fetch(chrome.runtime.getURL('styles.css'))
    .then(response => response.text())
    .then(css => {
      style.textContent = css;
      shadowRoot.appendChild(style);
    });
  
  // Toggle menu visibility
  floatingButton.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
  });
  
  // Hide menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target)) {
      dropdownMenu.style.display = 'none';
    }
  });
  
  // Function to extract page content if no text is selected
  function extractPageContent() {
    // Try to get main content
    const mainContent = document.querySelector('main') || 
                       document.querySelector('article') ||
                       document.querySelector('[role="main"]') ||
                       document.querySelector('.content') ||
                       document.body;
    
    // Remove script, style, and navigation elements
    const clonedContent = mainContent.cloneNode(true);
    const elementsToRemove = clonedContent.querySelectorAll('script, style, nav, header, footer, aside, .nav, .menu, .sidebar');
    elementsToRemove.forEach(el => el.remove());
    
    return clonedContent.textContent.trim().substring(0, 2000); // Limit to 2000 chars
  }
  
  // Handle menu item clicks
  dropdownMenu.addEventListener('click', (e) => {
    if (e.target.classList.contains('menu-item')) {
      e.preventDefault();
      const action = e.target.dataset.action;
      
      // Use selected text if available, otherwise extract page content
      const contentToSend = selectedText || extractPageContent();
      
      // Send message to background script
      chrome.runtime.sendMessage({
        action: action,
        url: window.location.href,
        selectedText: contentToSend
      });
      
      // Hide menu
      dropdownMenu.style.display = 'none';
    }
  });
  
  // Append elements to shadow DOM
  shadowRoot.appendChild(floatingButton);
  shadowRoot.appendChild(dropdownMenu);
  
  // Append container to body
  document.body.appendChild(container);
})();