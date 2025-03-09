# LegalLens AI Chrome Extension

A Chrome extension that helps you analyze privacy policies and terms of service to reveal potential dangers and protect your rights.

## Features

- **Extract and Analyze**: Automatically extract text from privacy policy pages or paste your own text to analyze.
- **Key Findings**: Get a detailed analysis of privacy terms with key findings and potential risks.
- **Privacy Metrics**: View privacy score, data usage risk, and security level assessments.
- **Ask Questions**: Ask specific questions about privacy policies and get AI-powered answers.
- **History**: Keep track of your previous analyses and questions.

## Installation

### Development Mode

1. Clone this repository
2. Navigate to the project directory
3. Run `npm install` to install dependencies
4. Run `npm run build-extension` to build the extension
5. Open Chrome and navigate to `chrome://extensions/`
6. Enable "Developer mode" (toggle in the top right)
7. Click "Load unpacked" and select the `dist` directory that was created

### From ZIP File (if available)

1. Download the extension ZIP file
2. Extract the ZIP file to a folder
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top right)
5. Click "Load unpacked" and select the extracted folder

## How to Use

### Analyzing Privacy Policies

1. Navigate to a website with a privacy policy or terms of service
2. Click the LegalLens AI extension icon in your browser toolbar
3. If you're on a privacy policy page, click "Extract from Current Page" to automatically extract the text
4. Alternatively, paste the privacy policy text into the text area
5. Click "Analyze Content" to get a detailed analysis

### Asking Questions

1. Click the LegalLens AI extension icon in your browser toolbar
2. Switch to the "Ask Questions" tab
3. Type your question about privacy policies or terms of service
4. Click "Ask Question" to get an AI-powered answer

### Viewing History

1. Click the LegalLens AI extension icon in your browser toolbar
2. Switch to the "History" tab
3. View your previous analyses and questions

## Automatic Detection

The extension will automatically detect when you're on a privacy policy or terms of service page and display a floating button. Click this button to quickly analyze the current page.

## Privacy

This extension processes text locally and sends it to an API for analysis. No data is stored on our servers beyond what's necessary to process your requests.

## Development

### Project Structure

- `manifest.json`: Chrome extension configuration
- `popup.html` & `popup.js`: Extension popup interface
- `background.js`: Background service worker
- `content.js`: Content script for webpage interaction
- `src/api/`: API integration for text analysis

### Building

Run `npm run build-extension` to build the extension to the `dist` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 