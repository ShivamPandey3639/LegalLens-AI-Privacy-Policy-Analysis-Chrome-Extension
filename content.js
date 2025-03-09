// Content script for LegalLens AI Chrome Extension

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractText') {
    // Extract text from the current page
    const pageText = extractPageContent();
    sendResponse({ success: true, text: pageText });
  }
  
  if (message.action === 'findPrivacyPolicy') {
    // Look for privacy policy links on the page
    const links = Array.from(document.querySelectorAll('a'));
    const privacyLinks = links.filter(link => {
      const text = link.textContent.toLowerCase();
      const href = (link.href || '').toLowerCase();
      return text.includes('privacy') || 
             text.includes('terms') || 
             href.includes('privacy') || 
             href.includes('terms');
    }).map(link => ({
      text: link.textContent.trim(),
      url: link.href
    }));
    
    sendResponse({ success: true, links: privacyLinks });
  }
  
  return true; // Required for async response
});

// Extract content from the page, focusing on the main content
function extractPageContent() {
  // Try to find the main content
  const possibleContentElements = [
    document.querySelector('main'),
    document.querySelector('article'),
    document.querySelector('.content'),
    document.querySelector('#content'),
    document.querySelector('.main'),
    document.querySelector('#main')
  ].filter(Boolean);
  
  if (possibleContentElements.length > 0) {
    // Use the first found content element
    return possibleContentElements[0].innerText;
  }
  
  // Fallback to body text, but try to exclude navigation, header, footer
  const bodyText = document.body.innerText;
  
  // Remove common navigation and footer text if possible
  const elementsToExclude = [
    document.querySelector('nav'),
    document.querySelector('header'),
    document.querySelector('footer'),
    document.querySelector('.nav'),
    document.querySelector('#nav'),
    document.querySelector('.footer'),
    document.querySelector('#footer')
  ].filter(Boolean);
  
  let cleanedText = bodyText;
  elementsToExclude.forEach(element => {
    if (element && element.innerText) {
      cleanedText = cleanedText.replace(element.innerText, '');
    }
  });
  
  return cleanedText;
}

// Add a floating button to the page
function addFloatingButton() {
  // Check if button already exists
  if (document.getElementById('legallens-button')) {
    return;
  }
  
  const button = document.createElement('div');
  button.id = 'legallens-button';
  button.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(to right, #0ea5e9, #6366f1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      z-index: 10000;
      transition: all 0.3s ease;
    ">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
      <span style="
        position: absolute;
        top: -5px;
        right: -5px;
        background-color: #ef4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      ">!</span>
    </div>
  `;
  
  document.body.appendChild(button);
  
  // Add hover effect
  const buttonElement = button.querySelector('div');
  buttonElement.addEventListener('mouseover', () => {
    buttonElement.style.transform = 'scale(1.1)';
  });
  
  buttonElement.addEventListener('mouseout', () => {
    buttonElement.style.transform = 'scale(1)';
  });
  
  // Add click handler
  button.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
    
    // Also extract the text and store it for later use
    const pageText = extractPageContent();
    chrome.storage.local.set({ lastExtractedText: pageText });
  });
  
  // Add tooltip
  const tooltip = document.createElement('div');
  tooltip.innerHTML = `
    <div style="
      position: fixed;
      bottom: 85px;
      right: 20px;
      background: rgba(15, 23, 42, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 14px;
      max-width: 200px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: none;
    ">
      Click to analyze this privacy policy with LegalLens AI
    </div>
  `;
  
  document.body.appendChild(tooltip);
  
  const tooltipElement = tooltip.querySelector('div');
  
  buttonElement.addEventListener('mouseover', () => {
    tooltipElement.style.display = 'block';
  });
  
  buttonElement.addEventListener('mouseout', () => {
    tooltipElement.style.display = 'none';
  });
}

// Check if we're on a page that might have privacy policies
function checkForPrivacyPage() {
  const url = window.location.href.toLowerCase();
  const pageText = document.body.innerText.toLowerCase();
  
  // Keywords that suggest this is a privacy policy or terms page
  const privacyKeywords = [
    'privacy policy',
    'privacy notice',
    'privacy statement',
    'terms of service',
    'terms of use',
    'terms and conditions',
    'data collection',
    'data processing',
    'personal information',
    'personal data',
    'gdpr',
    'ccpa'
  ];
  
  // Check URL first
  const isPrivacyUrl = url.includes('privacy') || 
                       url.includes('terms') || 
                       url.includes('tos') ||
                       url.includes('legal');
  
  // Then check content
  const hasPrivacyContent = privacyKeywords.some(keyword => 
    pageText.includes(keyword)
  );
  
  if (isPrivacyUrl || hasPrivacyContent) {
    // This might be a privacy policy page, add the button
    addFloatingButton();
    
    // Notify the background script
    chrome.runtime.sendMessage({ 
      action: 'privacyPageDetected',
      url: window.location.href
    });
  }
}

// Run when the page loads
window.addEventListener('load', () => {
  // Short delay to ensure page is fully loaded
  setTimeout(() => {
    checkForPrivacyPage();
  }, 1000);
}); 