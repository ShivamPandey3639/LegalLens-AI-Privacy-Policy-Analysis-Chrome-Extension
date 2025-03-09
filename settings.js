// Settings script for LegalLens AI Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
  // Default settings
  const defaultSettings = {
    autoDetect: true,
    showNotifications: true,
    cacheResults: true,
    apiKey: ''
  };
  
  // Get DOM elements
  const autoDetectToggle = document.getElementById('auto-detect');
  const showNotificationsToggle = document.getElementById('show-notifications');
  const cacheResultsToggle = document.getElementById('cache-results');
  const apiKeyInput = document.getElementById('api-key');
  const clearHistoryButton = document.getElementById('clear-history');
  const clearCacheButton = document.getElementById('clear-cache');
  const backButton = document.getElementById('back-button');
  const saveMessage = document.getElementById('save-message');
  const versionElement = document.getElementById('version');
  const buildDateElement = document.getElementById('build-date');
  
  // Load settings from storage
  function loadSettings() {
    chrome.storage.local.get(['settings'], function(result) {
      const settings = result.settings || defaultSettings;
      
      // Apply settings to UI
      autoDetectToggle.checked = settings.autoDetect;
      showNotificationsToggle.checked = settings.showNotifications;
      cacheResultsToggle.checked = settings.cacheResults;
      apiKeyInput.value = settings.apiKey || '';
    });
  }
  
  // Save settings to storage
  function saveSettings() {
    const settings = {
      autoDetect: autoDetectToggle.checked,
      showNotifications: showNotificationsToggle.checked,
      cacheResults: cacheResultsToggle.checked,
      apiKey: apiKeyInput.value.trim()
    };
    
    chrome.storage.local.set({settings: settings}, function() {
      // Show save message
      saveMessage.style.transform = 'translateY(0)';
      
      // Hide save message after 2 seconds
      setTimeout(() => {
        saveMessage.style.transform = 'translateY(16rem)';
      }, 2000);
    });
  }
  
  // Add event listeners for settings changes
  autoDetectToggle.addEventListener('change', saveSettings);
  showNotificationsToggle.addEventListener('change', saveSettings);
  cacheResultsToggle.addEventListener('change', saveSettings);
  apiKeyInput.addEventListener('blur', saveSettings);
  
  // Clear history
  clearHistoryButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all history?')) {
      chrome.storage.local.remove(['history'], function() {
        showMessage('History cleared successfully');
      });
    }
  });
  
  // Clear cache
  clearCacheButton.addEventListener('click', function() {
    if (confirm('Are you sure you want to clear all cached results?')) {
      chrome.storage.local.get(null, function(items) {
        const cacheKeys = Object.keys(items).filter(key => 
          key.startsWith('cache_') || key.startsWith('qa_cache_')
        );
        
        if (cacheKeys.length > 0) {
          chrome.storage.local.remove(cacheKeys, function() {
            showMessage('Cache cleared successfully');
          });
        } else {
          showMessage('No cache to clear');
        }
      });
    }
  });
  
  // Back button
  backButton.addEventListener('click', function() {
    window.location.href = 'popup.html';
  });
  
  // Show message
  function showMessage(message) {
    saveMessage.textContent = message;
    saveMessage.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      saveMessage.style.transform = 'translateY(16rem)';
    }, 2000);
  }
  
  // Load version info
  fetch('version.json')
    .then(response => response.json())
    .then(data => {
      versionElement.textContent = data.version;
      const buildDate = new Date(data.buildDate);
      buildDateElement.textContent = buildDate.toLocaleDateString() + ' ' + buildDate.toLocaleTimeString();
    })
    .catch(error => {
      console.error('Error loading version info:', error);
    });
  
  // Initialize
  loadSettings();
}); 