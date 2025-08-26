import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import { storage } from "./storage";
import { llmService } from "./services/llmService";
import { pptxService } from "./services/pptxService";
import { generationRequestSchema, analysisResultSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  dest: path.join(process.cwd(), "uploads/temp"),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pptx', '.potx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only .pptx and .potx files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", async (req, res) => {
    try {
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        services: {
          storage: "operational",
          llmService: "operational", 
          pptxService: "operational"
        },
        endpoints: {
          generate: "/api/generate",
          status: "/api/status/:id",
          preview: "/api/preview/:id", 
          download: "/api/download/:id",
          analyze: "/api/analyze"
        },
        supportedProviders: ["openai", "anthropic", "gemini"],
        requiredFields: ["textContent", "llmProvider", "apiKey", "model"],
        minContentLength: 100
      };

      res.json(healthData);
    } catch (error) {
      res.status(503).json({ 
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Health check failed"
      });
    }
  });

  // Analyze content endpoint
  app.post("/api/analyze", async (req, res) => {
    try {
      const { textContent, llmProvider, apiKey, model } = req.body;

      if (!textContent || textContent.length < 100) {
        return res.status(400).json({ error: "Content must be at least 100 characters" });
      }

      if (!llmProvider || !apiKey || !model) {
        return res.status(400).json({ error: "LLM provider, API key, and model are required" });
      }

      const analysis = await llmService.analyzeContent(textContent, llmProvider, apiKey, model);
      
      res.json(analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Analysis failed" });
    }
  });

  // Upload template endpoint
  app.post("/api/upload-template", upload.single('template'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No template file uploaded" });
      }

      const analysis = await pptxService.analyzeTemplate(req.file.path);
      
      res.json({
        fileName: req.file.originalname,
        size: req.file.size,
        path: req.file.path,
        analysis
      });
    } catch (error) {
      console.error("Template upload error:", error);
      // Clean up uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: error instanceof Error ? error.message : "Template upload failed" });
    }
  });

  // Unified PPT generation endpoint - handles all operations
  app.post("/api/ppt", async (req, res) => {
    try {
      console.log(`[UNIFIED ENDPOINT] Processing PPT request...`);
      
      const { action = "generate", ...requestData } = req.body;
      
      switch (action) {
        case "generate":
          return await handleGenerate(req, res, requestData);
        case "status":
          return await handleStatus(req, res, requestData);
        case "preview":
          return await handlePreview(req, res, requestData);
        case "download":
          return await handleDownload(req, res, requestData);
        case "analyze":
          return await handleAnalyze(req, res, requestData);
        default:
          return res.status(400).json({ error: "Invalid action. Use: generate, status, preview, download, or analyze" });
      }
    } catch (error) {
      console.error("[UNIFIED ENDPOINT ERROR]:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Request failed" });
    }
  });

  // Keep existing endpoint for backward compatibility
  app.post("/api/generate", async (req, res) => {
    try {
      const validationResult = generationRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: validationResult.error.issues
        });
      }

      const request = validationResult.data;
      const startTime = Date.now();

      // Create presentation record
      const presentation = await storage.createPresentation({
        originalText: request.textContent,
        guidance: request.guidance,
        llmProvider: request.llmProvider,
        model: request.model,
        templateFileName: request.templateFile,
        templateData: null,
        generatedSlides: null,
        status: "processing",
        resultFilePath: null,
        slideCount: null,
        processingTime: null,
      });

      // Process in background
      processPresentation(presentation.id, request).catch(console.error);

      res.json({ 
        presentationId: presentation.id,
        status: "processing"
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Generation failed" });
    }
  });

  // Check generation status endpoint
  app.get("/api/status/:id", async (req, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }

      res.json({
        id: presentation.id,
        status: presentation.status,
        slideCount: presentation.slideCount,
        processingTime: presentation.processingTime,
        resultFilePath: presentation.resultFilePath
      });
    } catch (error) {
      console.error("Status check error:", error);
      res.status(500).json({ error: "Status check failed" });
    }
  });

  // Preview generated presentation (opens in new window/tab)
  app.get("/api/preview/:id", async (req, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      
      if (!presentation || !presentation.resultFilePath) {
        return res.status(404).json({ error: "Presentation not found or not ready" });
      }

      if (!fs.existsSync(presentation.resultFilePath)) {
        return res.status(404).json({ error: "Generated file not found" });
      }

      // Create a preview showing slide structure and content details
      const slideInfo = presentation.generatedSlides || { slides: [] };
      const slidesPreviews = (slideInfo as any).slides ? (slideInfo as any).slides.map((slide: any, index: number) => {
        return `
          <div style="border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin: 10px 0; background: #fafafa;">
            <h3 style="margin: 0 0 10px 0; color: #333;">Slide ${index + 1}: ${slide.layout || 'Content'}</h3>
            <h4 style="color: #666; margin: 5px 0;">${slide.title || 'No Title'}</h4>
            <p style="color: #777; margin: 5px 0; font-size: 14px;">${(slide.content || slide.text || '').substring(0, 150)}${(slide.content || slide.text || '').length > 150 ? '...' : ''}</p>
          </div>
        `;
      }).join('') : '<p>No slide preview available</p>';

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Presentation Preview</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background: #f5f7fa; margin: 0; }
            .preview-container { max-width: 900px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px 30px; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; }
            .stats { display: flex; justify-content: space-between; margin: 20px 0; }
            .stat { text-align: center; padding: 15px; background: #f8f9ff; border-radius: 8px; flex: 1; margin: 0 5px; }
            .slides-preview { margin-top: 25px; }
            .actions { text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 20px; }
            .download-btn { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; font-weight: 500; }
            .download-btn:hover { background: #5a67d8; }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✨ Presentation Preview</h1>
              <p style="margin: 8px 0 0 0; opacity: 0.9;">Your AI-generated presentation is ready</p>
            </div>
            <div class="content">
              <div class="stats">
                <div class="stat">
                  <div style="font-size: 24px; font-weight: bold; color: #667eea;">${presentation.slideCount || '?'}</div>
                  <div style="color: #666; font-size: 14px;">Slides</div>
                </div>
                <div class="stat">
                  <div style="font-size: 24px; font-weight: bold; color: #667eea;">${presentation.status || 'Unknown'}</div>
                  <div style="color: #666; font-size: 14px;">Status</div>
                </div>
                <div class="stat">
                  <div style="font-size: 24px; font-weight: bold; color: #667eea;">${presentation.processingTime || 'N/A'}s</div>
                  <div style="color: #666; font-size: 14px;">Generation Time</div>
                </div>
              </div>
              
              <div class="slides-preview">
                <h2 style="margin: 0 0 15px 0; color: #333;">📑 Slide Content Preview</h2>
                ${slidesPreviews}
              </div>
              
              <div class="actions">
                <a href="/api/download/${req.params.id}" class="download-btn">📥 Download PowerPoint File</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error("Preview error:", error);
      res.status(500).json({ error: "Preview failed" });
    }
  });

  // Download generated presentation
  app.get("/api/download/:id", async (req, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      
      if (!presentation || !presentation.resultFilePath) {
        return res.status(404).json({ error: "Presentation not found or not ready" });
      }

      if (!fs.existsSync(presentation.resultFilePath)) {
        return res.status(404).json({ error: "Generated file not found" });
      }

      const fileName = `${presentation.originalText.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.pptx`;
      
      res.download(presentation.resultFilePath, fileName, (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).json({ error: "Download failed" });
        }
      });
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ error: "Download failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Handler functions for unified endpoint
async function handleGenerate(req: any, res: any, requestData: any) {
  const validationResult = generationRequestSchema.safeParse(requestData);
  
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: "Invalid request data",
      details: validationResult.error.issues
    });
  }

  const request = validationResult.data;

  // Create presentation record
  const presentation = await storage.createPresentation({
    originalText: request.textContent,
    guidance: request.guidance,
    llmProvider: request.llmProvider,
    model: request.model,
    templateFileName: request.templateFile,
    templateData: null,
    generatedSlides: null,
    status: "processing",
    resultFilePath: null,
    slideCount: null,
    processingTime: null,
  });

  // Process in background
  processPresentation(presentation.id, request).catch(console.error);

  res.json({ 
    presentationId: presentation.id,
    status: "processing"
  });
}

async function handleStatus(req: any, res: any, requestData: any) {
  const { presentationId } = requestData;
  
  if (!presentationId) {
    return res.status(400).json({ error: "presentationId is required" });
  }

  const presentation = await storage.getPresentation(presentationId);
  
  if (!presentation) {
    return res.status(404).json({ error: "Presentation not found" });
  }

  res.json({
    id: presentation.id,
    status: presentation.status,
    slideCount: presentation.slideCount,
    processingTime: presentation.processingTime,
    resultFilePath: presentation.resultFilePath
  });
}

async function handlePreview(req: any, res: any, requestData: any) {
  const { presentationId } = requestData;
  
  if (!presentationId) {
    return res.status(400).json({ error: "presentationId is required" });
  }

  const presentation = await storage.getPresentation(presentationId);
  
  if (!presentation || !presentation.generatedSlides) {
    return res.status(404).json({ error: "Presentation not found or not ready" });
  }

  // Return slide content for preview
  const slideData = presentation.generatedSlides as any;
  res.json({
    id: presentation.id,
    status: presentation.status,
    title: slideData.title || "Generated Presentation",
    slides: slideData.slides || [],
    slideCount: presentation.slideCount
  });
}

async function handleDownload(req: any, res: any, requestData: any) {
  const { presentationId } = requestData;
  
  if (!presentationId) {
    return res.status(400).json({ error: "presentationId is required" });
  }

  const presentation = await storage.getPresentation(presentationId);
  
  if (!presentation || !presentation.resultFilePath) {
    return res.status(404).json({ error: "Presentation not found or not ready" });
  }

  if (!fs.existsSync(presentation.resultFilePath)) {
    return res.status(404).json({ error: "Generated file not found" });
  }

  // Return file download information
  res.json({
    id: presentation.id,
    downloadUrl: `/api/download/${presentation.id}`,
    fileName: `presentation_${presentation.id}.pptx`,
    status: presentation.status,
    fileSize: fs.statSync(presentation.resultFilePath).size
  });
}

async function handleAnalyze(req: any, res: any, requestData: any) {
  const { textContent, llmProvider, apiKey, model } = requestData;

  if (!textContent || textContent.length < 100) {
    return res.status(400).json({ error: "Content must be at least 100 characters" });
  }

  if (!llmProvider || !apiKey || !model) {
    return res.status(400).json({ error: "LLM provider, API key, and model are required" });
  }

  const analysis = await llmService.analyzeContent(textContent, llmProvider, apiKey, model);
  
  res.json(analysis);
}

// Background processing function
async function processPresentation(presentationId: string, request: any) {
  try {
    await storage.updatePresentation(presentationId, { status: "analyzing" });

    // Generate slide content using LLM
    const slideData = await llmService.generateSlideContent(request);

    await storage.updatePresentation(presentationId, { 
      status: "generating_slides",
      generatedSlides: slideData,
      slideCount: slideData.totalSlides
    });

    // Generate PowerPoint file
    const outputPath = await pptxService.generatePresentation(
      slideData,
      request.templateFile,
      request.options
    );

    const processingTime = Math.floor((Date.now() - Date.now()) / 1000); // This should use actual start time

    await storage.updatePresentation(presentationId, {
      status: "completed",
      resultFilePath: outputPath,
      processingTime
    });

  } catch (error) {
    console.error("Processing error:", error);
    await storage.updatePresentation(presentationId, {
      status: "failed"
    });
  }
}
