# PowerPoint Generator

## Overview

This is a full-stack web application that transforms text content into professional PowerPoint presentations using AI. Users can input text content, configure AI providers (OpenAI, Anthropic, or Gemini), optionally upload template files, and generate customized presentations with various styling options. The application features a modern React frontend with shadcn/ui components and an Express.js backend that handles AI integration and PowerPoint generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: React Query (@tanstack/react-query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON communication
- **File Handling**: Multer for multipart file uploads with size and type validation
- **Storage**: In-memory storage implementation with interface for future database integration
- **Error Handling**: Centralized error handling middleware with structured error responses

### Data Storage Solutions
- **Current Implementation**: In-memory storage using Map data structure for presentations
- **Database Schema**: Designed for PostgreSQL with Drizzle ORM
- **Migration Support**: Drizzle Kit configured for database schema management
- **Data Models**: Presentations table with fields for content, AI configuration, template data, and generation results

### Authentication and Authorization
- **Session Management**: Configured for PostgreSQL session storage using connect-pg-simple
- **Security**: CORS and request logging middleware implemented
- **File Security**: Upload restrictions for file types (.pptx, .potx) and size limits (50MB)

### External Dependencies

#### AI/LLM Providers
- **OpenAI**: Integration with latest GPT models for content analysis and slide generation
- **Anthropic**: Claude integration for natural language processing
- **Google Gemini**: Alternative AI provider for content generation
- **Model Support**: Configurable model selection per provider with latest model defaults

#### Database and ORM
- **Neon Database**: Serverless PostgreSQL database provider
- **Drizzle ORM**: Type-safe database queries and schema management
- **Connection**: Environment-based database URL configuration

#### PowerPoint Generation
- **PptxGenJS**: Library for programmatic PowerPoint file creation
- **Template Analysis**: PPTX file parsing for layout and style extraction
- **File Processing**: Template upload, analysis, and content generation pipeline

#### Development and Build Tools
- **Vite**: Fast development server and build tool with React plugin
- **Replit Integration**: Development environment plugins and error overlay
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Production bundling for server-side code

The application follows a modular architecture with clear separation between frontend components, backend services, and external integrations. The codebase is structured for scalability with shared TypeScript schemas and comprehensive error handling throughout the stack.