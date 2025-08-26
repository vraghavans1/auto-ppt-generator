# Deployment Guide

## Working Hosted Demo

**Live Demo URL**: https://docu-genius-22f3002203.replit.app/

### API Endpoints (External Access)

- **Health Check**: `GET https://docu-genius-22f3002203.replit.app/api/health`
- **Generate PPT**: `POST https://docu-genius-22f3002203.replit.app/api/generate`
- **Check Status**: `GET https://docu-genius-22f3002203.replit.app/api/status/{id}`
- **Download PPT**: `GET https://docu-genius-22f3002203.replit.app/api/download/{id}`

### External API Usage Example

```bash
curl -X POST https://docu-genius-22f3002203.replit.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "textContent": "Artificial Intelligence is revolutionizing healthcare through machine learning algorithms that analyze medical data and predict patient outcomes for better treatment planning. These advanced systems enable faster diagnosis, reduce medical errors, and improve overall healthcare delivery efficiency.",
    "llmProvider": "openai",
    "apiKey": "your-openai-api-key-here", 
    "model": "gpt-4",
    "options": {
      "targetSlides": "3",
      "presentationStyle": "professional",
      "contentDensity": "balanced",
      "generateNotes": "auto"
    }
  }'
```

## Deployment Options

### Option 1: Deploy on Replit
1. Import this repository to Replit
2. Run `npm install`
3. Click the "Deploy" button
4. Configure custom domain (optional)

### Option 2: Deploy on Vercel
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically on push

### Option 3: Deploy on Netlify
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Enable continuous deployment

### Option 4: Self-hosted
```bash
npm install
npm run build
npm start
```

## Environment Requirements

- Node.js 18+
- npm or yarn
- No database required (uses in-memory storage)
- No additional environment variables needed

## API Key Configuration

The application doesn't require pre-configured API keys. Users provide their own API keys through the web interface:

- OpenAI API keys from https://platform.openai.com/api-keys
- Anthropic API keys from https://console.anthropic.com/
- Google AI API keys from https://ai.google.dev/

This approach ensures:
- No server-side API key storage
- Users control their own API usage and costs
- Better security and privacy

## Monitoring and Logs

The application includes built-in request logging and error handling:
- API request/response logging
- Error tracking with detailed messages
- Performance monitoring
- Health check endpoint for uptime monitoring

## Security Features

- CORS configuration for cross-origin requests
- Input validation with Zod schemas
- File upload restrictions (size and type limits)
- Temporary file cleanup
- No persistent data storage