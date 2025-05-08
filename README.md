# LegalLens AI Chrome Extension

A Chrome extension that helps you analyze privacy policies and terms of service to reveal potential dangers and protect your rights.

![LegalLens AI Logo](public/icon128.svg)

## Features

- **Extract and Analyze**: Automatically extract text from privacy policy pages or paste your own text to analyze.
- **Key Findings**: Get a detailed analysis of privacy terms with key findings and potential risks.
- **Privacy Metrics**: View privacy score, data usage risk, and security level assessments.
- **Ask Questions**: Ask specific questions about privacy policies and get AI-powered answers.
- **History**: Keep track of your previous analyses and questions.
- **Auto-detection**: Automatically detects when you're on a privacy policy page and shows a floating button.

## Installation

### Development Mode

1. Clone this repository
   ```
   git clone https://github.com/yourusername/legallens-ai.git
   cd legallens-ai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your Hugging Face API key:
   ```
   HF_API_KEY=your_huggingface_api_key_here
   NODE_ENV=development
   ```

4. Build the extension
   ```
   npm run build-extension
   ```

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked" and select the `dist` directory that was created

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
4. Click on any history item to view the full details

### Adjusting Settings

1. Click the LegalLens AI extension icon in your browser toolbar
2. Click the settings icon in the top right corner
3. Adjust settings such as auto-detection, notifications, and caching
4. Enter your own Hugging Face API key if you have one
5. Clear history or cache as needed

## Automatic Detection

The extension will automatically detect when you're on a privacy policy or terms of service page and display a floating button. Click this button to quickly analyze the current page.

## Privacy

This extension processes text locally and sends it to an API for analysis. No data is stored on our servers beyond what's necessary to process your requests. See our [Privacy Policy](privacy-policy.html) for more details.

## Development

### Project Structure

- `manifest.json`: Chrome extension configuration
- `popup.html` & `popup.js`: Extension popup interface
- `settings.html` & `settings.js`: Settings page
- `background.js`: Background service worker
- `content.js`: Content script for webpage interaction
- `src/api/`: API integration for text analysis
- `build-extension.js`: Build script for the extension

┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│                        LegalLens AI Data Flow                             │
│                        ────────────────────────                           │
│                                                                           │
│  ┌──────────┐     ┌───────────┐     ┌──────────┐     ┌───────────────┐   │
│  │   User   │────▶│ Interface │────▶│   API    │────▶│ HuggingFace   │   │
│  └──────────┘     └───────────┘     └──────────┘     └───────────────┘   │
│       │                 ▲               │                    │            │
│       │                 │               │                    │            │
│       │                 └───────────────┘                    │            │
│       │                                                      │            │
│       └──────────────────────────────────────────────────────┘            │
│                                                                           │
│  1. User uploads/pastes privacy policy or asks question                   │
│  2. Interface sends text to API                                           │
│  3. API processes request and calls HuggingFace                           │
│  4. HuggingFace returns analysis/answer                                   │
│  5. API formats response and returns to interface                         │
│  6. Interface displays results to user                                    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

### Building

Run `npm run build-extension` to build the extension to the `dist` directory.

## Troubleshooting

- **Extension not working**: Make sure you have enabled all required permissions during installation.
- **Analysis fails**: Check your internet connection and ensure your API key is valid.
- **Text extraction issues**: Some websites may block content extraction. Try copying and pasting the text manually.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
