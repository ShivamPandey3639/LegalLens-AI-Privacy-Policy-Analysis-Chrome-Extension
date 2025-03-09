// Popup script for LegalLens AI Chrome Extension

document.addEventListener('DOMContentLoaded', function() {
  // Tab switching functionality
  const tabs = {
    analyze: document.getElementById('tab-analyze'),
    qa: document.getElementById('tab-qa'),
    history: document.getElementById('tab-history')
  };
  
  const contents = {
    analyze: document.getElementById('content-analyze'),
    qa: document.getElementById('content-qa'),
    history: document.getElementById('content-history')
  };
  
  function switchTab(tabName) {
    // Update tab styles
    Object.keys(tabs).forEach(key => {
      if (key === tabName) {
        tabs[key].classList.add('tab-active');
        tabs[key].classList.remove('text-gray-400');
      } else {
        tabs[key].classList.remove('tab-active');
        tabs[key].classList.add('text-gray-400');
      }
    });
    
    // Show/hide content
    Object.keys(contents).forEach(key => {
      if (key === tabName) {
        contents[key].classList.remove('hidden');
      } else {
        contents[key].classList.add('hidden');
      }
    });
  }
  
  // Add tab click listeners
  tabs.analyze.addEventListener('click', () => switchTab('analyze'));
  tabs.qa.addEventListener('click', () => switchTab('qa'));
  tabs.history.addEventListener('click', () => switchTab('history'));
  
  // Check for previously extracted text
  chrome.storage.local.get(['lastExtractedText'], function(result) {
    if (result.lastExtractedText) {
      document.getElementById('text-input').value = result.lastExtractedText;
      // Clear it after using it
      chrome.storage.local.remove(['lastExtractedText']);
    }
  });
  
  // Extract text from current page
  document.getElementById('extract-page').addEventListener('click', function() {
    // Show a small loading indicator
    this.innerHTML = `
      <div class="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
      Extracting...
    `;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'extractText'}, function(response) {
        // Reset button text
        document.getElementById('extract-page').innerHTML = `
          <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Extract from Current Page
        `;
        
        if (response && response.success) {
          document.getElementById('text-input').value = response.text;
        } else {
          showError('Could not extract text from the current page. Make sure you are on a webpage with text content.');
        }
      });
    });
  });
  
  // Analyze button functionality
  document.getElementById('analyze-btn').addEventListener('click', function() {
    const textInput = document.getElementById('text-input').value.trim();
    
    if (!textInput) {
      showError('Please enter or extract text to analyze.');
      return;
    }
    
    // Show loading state
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('results').classList.add('hidden');
    
    // Add debug message in the loading area
    const loadingElement = document.getElementById('loading');
    loadingElement.innerHTML = `
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <p class="mt-3 text-gray-400">Analyzing content...</p>
      <p class="mt-1 text-xs text-gray-500">Starting API request...</p>
    `;
    
    // Check cache first
    const cacheKey = 'cache_' + hashString(textInput);
    chrome.storage.local.get([cacheKey], function(result) {
      if (result[cacheKey]) {
        console.log('Using cached result');
        displayResults(result[cacheKey], textInput);
        return;
      }
      
      // Update loading message
      loadingElement.querySelector('p.text-xs').textContent = 'Sending request to API...';
      
      // Not in cache, send message to background script
      chrome.runtime.sendMessage(
        {action: 'analyzeText', text: textInput},
        function(response) {
          // Hide loading state
          document.getElementById('loading').classList.add('hidden');
          
          if (response && response.success) {
            // Cache the result
            const cacheData = {
              data: response.data,
              timestamp: Date.now()
            };
            
            const cacheObj = {};
            cacheObj[cacheKey] = cacheData;
            chrome.storage.local.set(cacheObj);
            
            // Display results
            displayResults(cacheData, textInput);
          } else {
            // Show detailed error
            const errorMessage = response?.error || 'Error analyzing text. Please try again.';
            showError(`Analysis failed: ${errorMessage}`);
            
            // Also show a more detailed troubleshooting section
            const analyzeContent = document.getElementById('content-analyze');
            const troubleshootDiv = document.createElement('div');
            troubleshootDiv.className = 'mt-4 p-4 bg-gray-800 rounded-lg text-sm';
            troubleshootDiv.innerHTML = `
              <h3 class="font-medium text-red-400 mb-2">Troubleshooting Steps:</h3>
              <ol class="list-decimal pl-5 space-y-1 text-gray-300">
                <li>Check your internet connection</li>
                <li>Verify the API key in settings is correct</li>
                <li>Try with a shorter text sample</li>
                <li>Reload the extension from chrome://extensions/</li>
                <li>Check if the Hugging Face API is operational</li>
              </ol>
              <p class="mt-2 text-xs text-gray-400">Error details: ${errorMessage}</p>
            `;
            
            // Insert after the loading element
            const loadingElement = document.getElementById('loading');
            loadingElement.parentNode.insertBefore(troubleshootDiv, loadingElement.nextSibling);
          }
        }
      );
    });
  });
  
  // Function to display analysis results
  function displayResults(cacheData, textInput) {
    // Hide loading state
    document.getElementById('loading').classList.add('hidden');
    
    // Display results
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results-content').textContent = cacheData.data;
    
    // Parse metrics from the response
    const metrics = parseMetrics(cacheData.data);
    document.getElementById('privacy-score').textContent = metrics.privacyScore + '/100';
    
    // Set color based on score
    const privacyScoreElement = document.getElementById('privacy-score');
    if (metrics.privacyScore < 40) {
      privacyScoreElement.style.color = '#ef4444'; // Red
    } else if (metrics.privacyScore < 70) {
      privacyScoreElement.style.color = '#f59e0b'; // Yellow
    } else {
      privacyScoreElement.style.color = '#10b981'; // Green
    }
    
    document.getElementById('data-usage').textContent = metrics.dataUsage;
    document.getElementById('security-level').textContent = metrics.securityLevel;
    
    // Set colors for data usage and security
    const dataUsageElement = document.getElementById('data-usage');
    if (metrics.dataUsage === 'High') {
      dataUsageElement.style.color = '#ef4444'; // Red
    } else if (metrics.dataUsage === 'Medium') {
      dataUsageElement.style.color = '#f59e0b'; // Yellow
    } else {
      dataUsageElement.style.color = '#10b981'; // Green
    }
    
    const securityElement = document.getElementById('security-level');
    if (metrics.securityLevel === 'Low') {
      securityElement.style.color = '#ef4444'; // Red
    } else if (metrics.securityLevel === 'Medium') {
      securityElement.style.color = '#f59e0b'; // Yellow
    } else {
      securityElement.style.color = '#10b981'; // Green
    }
    
    // Save to history
    saveToHistory({
      type: 'analysis',
      timestamp: new Date().toISOString(),
      text: textInput.substring(0, 100) + (textInput.length > 100 ? '...' : ''),
      result: cacheData.data
    });
    
    // Update history tab
    updateHistoryList();
  }
  
  // QA button functionality
  document.getElementById('qa-btn').addEventListener('click', function() {
    const qaInput = document.getElementById('qa-input').value.trim();
    
    if (!qaInput) {
      showError('Please enter a question.');
      return;
    }
    
    // Show loading state
    document.getElementById('qa-loading').classList.remove('hidden');
    document.getElementById('qa-results').classList.add('hidden');
    
    // Check cache first
    const cacheKey = 'qa_cache_' + hashString(qaInput);
    chrome.storage.local.get([cacheKey], function(result) {
      if (result[cacheKey]) {
        console.log('Using cached QA result');
        displayQAResults(result[cacheKey], qaInput);
        return;
      }
      
      // Not in cache, send message to background script
      chrome.runtime.sendMessage(
        {action: 'askQuestion', question: qaInput},
        function(response) {
          // Hide loading state
          document.getElementById('qa-loading').classList.add('hidden');
          
          if (response && response.success) {
            // Cache the result
            const cacheData = {
              data: response.data,
              timestamp: Date.now()
            };
            
            const cacheObj = {};
            cacheObj[cacheKey] = cacheData;
            chrome.storage.local.set(cacheObj);
            
            // Display results
            displayQAResults(cacheData, qaInput);
          } else {
            showError(response?.error || 'Error processing question. Please try again.');
          }
        }
      );
    });
  });
  
  // Function to display QA results
  function displayQAResults(cacheData, qaInput) {
    // Hide loading state
    document.getElementById('qa-loading').classList.add('hidden');
    
    // Display results
    document.getElementById('qa-results').classList.remove('hidden');
    document.getElementById('qa-results-content').textContent = cacheData.data;
    
    // Save to history
    saveToHistory({
      type: 'question',
      timestamp: new Date().toISOString(),
      question: qaInput,
      answer: cacheData.data
    });
    
    // Update history tab
    updateHistoryList();
  }
  
  // Parse metrics from the response text
  function parseMetrics(text) {
    // Default values
    let privacyScore = 50;
    let dataUsage = 'Medium';
    let securityLevel = 'Medium';
    
    // Try to extract metrics from the text
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const privacyScoreMatch = line.match(/Privacy Score:\s*(\d+)\/100/i);
      if (privacyScoreMatch) {
        privacyScore = parseInt(privacyScoreMatch[1], 10);
      }
      
      const dataUsageMatch = line.match(/Data Usage Risk:\s*(Low|Medium|High)/i);
      if (dataUsageMatch) {
        dataUsage = dataUsageMatch[1];
      }
      
      const securityLevelMatch = line.match(/Overall Security Level:\s*(Low|Medium|High)/i);
      if (securityLevelMatch) {
        securityLevel = securityLevelMatch[1];
      }
    });
    
    return { privacyScore, dataUsage, securityLevel };
  }
  
  // Save item to history in chrome.storage
  function saveToHistory(item) {
    chrome.storage.local.get(['history'], function(result) {
      const history = result.history || [];
      history.unshift(item); // Add to beginning
      
      // Keep only the last 10 items
      if (history.length > 10) {
        history.pop();
      }
      
      chrome.storage.local.set({history: history});
    });
  }
  
  // Update history list in the UI
  function updateHistoryList() {
    chrome.storage.local.get(['history'], function(result) {
      const history = result.history || [];
      const historyList = document.getElementById('history-list');
      
      if (history.length === 0) {
        historyList.innerHTML = '<p class="text-gray-400 text-sm italic">No history yet</p>';
        return;
      }
      
      historyList.innerHTML = '';
      
      history.forEach(item => {
        const date = new Date(item.timestamp);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        const historyItem = document.createElement('div');
        historyItem.className = 'bg-gray-800 rounded-lg p-3 text-sm mb-3 cursor-pointer hover:bg-gray-700 transition-colors';
        
        if (item.type === 'analysis') {
          historyItem.innerHTML = `
            <div class="flex justify-between items-start mb-1">
              <span class="font-medium">Analysis</span>
              <span class="text-xs text-gray-500">${formattedDate}</span>
            </div>
            <p class="text-gray-400 text-xs truncate">${item.text}</p>
          `;
          
          // Add click handler to show the analysis again
          historyItem.addEventListener('click', function() {
            document.getElementById('results-content').textContent = item.result;
            document.getElementById('results').classList.remove('hidden');
            
            // Parse metrics from the response
            const metrics = parseMetrics(item.result);
            document.getElementById('privacy-score').textContent = metrics.privacyScore + '/100';
            document.getElementById('data-usage').textContent = metrics.dataUsage;
            document.getElementById('security-level').textContent = metrics.securityLevel;
            
            // Switch to analyze tab
            switchTab('analyze');
          });
        } else {
          historyItem.innerHTML = `
            <div class="flex justify-between items-start mb-1">
              <span class="font-medium">Question</span>
              <span class="text-xs text-gray-500">${formattedDate}</span>
            </div>
            <p class="text-gray-400 text-xs truncate">${item.question}</p>
          `;
          
          // Add click handler to show the question and answer again
          historyItem.addEventListener('click', function() {
            document.getElementById('qa-input').value = item.question;
            document.getElementById('qa-results-content').textContent = item.answer;
            document.getElementById('qa-results').classList.remove('hidden');
            
            // Switch to QA tab
            switchTab('qa');
          });
        }
        
        historyList.appendChild(historyItem);
      });
    });
  }
  
  // Show error message
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-900 text-white px-4 py-3 rounded-lg mb-4 flex items-start';
    errorDiv.innerHTML = `
      <svg class="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${message}</span>
    `;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'ml-auto flex-shrink-0 text-white';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', function() {
      errorDiv.remove();
    });
    
    errorDiv.appendChild(closeButton);
    
    // Insert at the top of the active content
    const activeContent = document.querySelector('.tab-content:not(.hidden)');
    activeContent.insertBefore(errorDiv, activeContent.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 5000);
  }
  
  // Simple string hashing function for cache keys
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }
  
  // Clear cache older than 24 hours
  function clearOldCache() {
    chrome.storage.local.get(null, function(items) {
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      Object.keys(items).forEach(key => {
        // Only process cache items
        if (key.startsWith('cache_') || key.startsWith('qa_cache_')) {
          const item = items[key];
          if (item.timestamp && (now - item.timestamp > oneDayMs)) {
            // Remove old cache item
            chrome.storage.local.remove(key);
            console.log('Removed old cache item:', key);
          }
        }
      });
    });
  }
  
  // Initialize history list
  updateHistoryList();
  
  // Clear old cache
  clearOldCache();
}); 