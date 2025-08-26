# Auto PPT Generator

Transform text content into professional PowerPoint presentations using AI. Upload templates to maintain your brand styling, fonts, and colors while letting AI generate compelling slide content.

## 🚀 Features

- **AI-Powered Content Generation**: Converts large text blocks into structured presentations using OpenAI, Anthropic, or Google Gemini
- **Template-Based Styling**: Upload PowerPoint templates to preserve colors, fonts, and branding
- **Multiple LLM Providers**: Choose from GPT-4, Claude, or Gemini models
- **Smart Content Analysis**: Automatically detects structure, estimates slide count, and optimizes layout
- **Real-time Processing**: Live status updates with progress tracking
- **Professional Output**: Generates native PowerPoint files (.pptx) ready for presentation

## 🛠 Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/auto-ppt-generator.git
   cd auto-ppt-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Environment Configuration

The application requires API keys for AI providers. Enter your keys directly in the web interface:

- **OpenAI**: Get your API key from https://platform.openai.com/api-keys
- **Anthropic**: Get your API key from https://console.anthropic.com/
- **Google AI**: Get your API key from https://ai.google.dev/

## 📖 Usage Guide

### Basic Usage

1. **Input Content**: Paste your text content (minimum 100 characters)
   - Supports markdown formatting
   - Works with research notes, meeting transcripts, articles, etc.

2. **Configure AI Provider**: Select your preferred LLM and enter your API key
   - Choose from OpenAI GPT-4, Anthropic Claude, or Google Gemini
   - API keys are not stored and only used for generation

3. **Upload Template (Optional)**: Upload a PowerPoint template (.pptx or .potx)
   - Colors, fonts, and images will be extracted automatically
   - Templates help maintain brand consistency

4. **Generate Presentation**: Click "Generate Presentation"
   - Real-time progress tracking
   - Automatic slide count optimization
   - Content analysis and structure detection

5. **Download Results**: Download your generated PowerPoint file
   - Preview slides before downloading
   - Native .pptx format compatible with Microsoft PowerPoint

### Advanced Features

- **Content Guidance**: Add presentation type hints (e.g., "investor pitch", "technical walkthrough")
- **Slide Count Control**: Choose target slide count or let AI decide automatically
- **Style Options**: Configure content density and presentation style
- **Speaker Notes**: Enable automatic generation of speaker notes

## 🏗 Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Application pages
│   │   └── lib/           # Utility libraries
├── server/                # Express.js backend
│   ├── services/          # Business logic services
│   │   ├── llmService.ts  # AI provider integrations
│   │   └── pptxService.ts # PowerPoint generation
│   ├── routes.ts          # API endpoint definitions
│   └── storage.ts         # Data storage interface
├── shared/                # Shared TypeScript schemas
└── uploads/               # Temporary file storage
```

## 🔧 Development

### Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with custom themes
- **PowerPoint Generation**: PptxGenJS library
- **File Processing**: JSZip for template analysis

### Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run type-check # TypeScript type checking
```

### API Endpoints

- `POST /api/upload-template` - Upload PowerPoint template
- `POST /api/generate` - Start presentation generation
- `GET /api/status/:id` - Check generation status
- `GET /api/preview/:id` - Preview generated slides
- `GET /api/download/:id` - Download presentation file

## 🔒 Security & Privacy

- **No Data Storage**: API keys and content are not stored permanently
- **Temporary Files**: Uploaded templates and generated files are automatically cleaned
- **HTTPS Only**: All communications are encrypted
- **No Tracking**: No user analytics or tracking implemented

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for effortless presentation creation**