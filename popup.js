// Popup functionality

document.addEventListener('DOMContentLoaded', () => {
  // Load current settings
  loadSettings();
  
  // Get current tab URL for "Hide on this site" functionality
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      window.currentTabUrl = tabs[0].url;
    }
  });
  
  // Event listeners
  document.getElementById('extensionEnabled').addEventListener('change', handleExtensionToggle);
  document.getElementById('addPattern').addEventListener('click', handleAddPattern);
  document.getElementById('hideOnThisSite').addEventListener('click', handleHideOnThisSite);
  document.getElementById('newPattern').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleAddPattern();
    }
  });
});

function loadSettings() {
  chrome.storage.sync.get(['excludedSites', 'extensionEnabled'], (data) => {
    // Set extension enabled status
    const enabled = data.extensionEnabled !== false; // Default to true
    document.getElementById('extensionEnabled').checked = enabled;
    updateStatusDisplay(enabled);
    
    // Load excluded sites
    const excludedSites = data.excludedSites || [];
    displayPatterns(excludedSites);
  });
}

function handleExtensionToggle(e) {
  const enabled = e.target.checked;
  chrome.storage.sync.set({ extensionEnabled: enabled }, () => {
    updateStatusDisplay(enabled);
  });
}

function updateStatusDisplay(enabled) {
  const statusText = document.getElementById('statusText');
  statusText.textContent = enabled ? 'Active' : 'Inactive';
  statusText.className = enabled ? 'active' : 'inactive';
}

function handleAddPattern() {
  const input = document.getElementById('newPattern');
  const pattern = input.value.trim();
  
  if (!pattern) return;
  
  // Validate regex
  try {
    new RegExp(pattern);
  } catch (e) {
    alert('Invalid regex pattern. Please check your syntax.');
    return;
  }
  
  // Add to storage
  chrome.storage.sync.get(['excludedSites'], (data) => {
    const excludedSites = data.excludedSites || [];
    if (!excludedSites.includes(pattern)) {
      excludedSites.push(pattern);
      chrome.storage.sync.set({ excludedSites }, () => {
        displayPatterns(excludedSites);
        input.value = '';
      });
    }
  });
}

function handleHideOnThisSite() {
  if (!window.currentTabUrl) {
    alert('Unable to get current site URL.');
    return;
  }
  
  try {
    const url = new URL(window.currentTabUrl);
    const domain = url.hostname;
    // Create a pattern that matches the entire domain
    const pattern = `.*${domain.replace(/\./g, '\\.')}.*`;
    
    // Add to excluded sites
    chrome.storage.sync.get(['excludedSites'], (data) => {
      const excludedSites = data.excludedSites || [];
      if (!excludedSites.includes(pattern)) {
        excludedSites.push(pattern);
        chrome.storage.sync.set({ excludedSites }, () => {
          displayPatterns(excludedSites);
          // Show success message
          const btn = document.getElementById('hideOnThisSite');
          const originalText = btn.textContent;
          btn.textContent = 'Added!';
          btn.style.backgroundColor = '#10b981';
          btn.style.color = 'white';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
            btn.style.color = '';
          }, 2000);
        });
      }
    });
  } catch (e) {
    alert('Unable to process current site URL.');
  }
}

function displayPatterns(patterns) {
  const container = document.getElementById('patternsList');
  
  if (patterns.length === 0) {
    container.innerHTML = '<div class="empty-state">No excluded sites</div>';
    return;
  }
  
  container.innerHTML = patterns.map((pattern, index) => `
    <div class="pattern-item">
      <span class="pattern-text">${escapeHtml(pattern)}</span>
      <button class="remove-btn" data-index="${index}">Remove</button>
    </div>
  `).join('');
  
  // Add remove event listeners
  container.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = parseInt(e.target.dataset.index);
      removePattern(index);
    });
  });
}

function removePattern(index) {
  chrome.storage.sync.get(['excludedSites'], (data) => {
    const excludedSites = data.excludedSites || [];
    excludedSites.splice(index, 1);
    chrome.storage.sync.set({ excludedSites }, () => {
      displayPatterns(excludedSites);
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}