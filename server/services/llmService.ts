import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, GenerationRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const DEFAULT_OPENAI_MODEL = "gpt-5";
// The newest Anthropic model is "claude-sonnet-4-20250514"
const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
// The newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

export class LLMService {
  async analyzeContent(textContent: string, provider: string, apiKey: string, model: string): Promise<AnalysisResult> {
    const prompt = `Analyze the following text content and provide a JSON response with:
    - estimatedSlides: number of slides needed (reasonable estimate)
    - contentType: type of content (e.g., "Technical Article", "Business Proposal", etc.)
    - readingTime: estimated reading time (e.g., "5 min read")
    - structure: content structure type (e.g., "Hierarchical", "Sequential", "Problem-Solution")
    - sections: array of main section titles/headings found

    Text content:
    ${textContent}

    Respond only with valid JSON.`;

    let response: string;

    switch (provider) {
      case "openai":
        response = await this.callOpenAI(prompt, apiKey, model);
        break;
      case "anthropic":
        response = await this.callAnthropic(prompt, apiKey, model);
        break;
      case "gemini":
        response = await this.callGemini(prompt, apiKey, model);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }

    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Failed to parse LLM response: ${error}`);
    }
  }

  async generateSlideContent(request: GenerationRequest): Promise<any> {
    const { textContent, guidance, options, llmProvider, apiKey, model } = request;

    const systemPrompt = `You are an expert presentation designer. Convert the given text into a structured PowerPoint presentation.

Guidelines:
- Presentation style: ${options.presentationStyle}
- Content density: ${options.contentDensity}
- Target slides: ${options.targetSlides === "auto" ? "determine automatically" : options.targetSlides}
- Generate speaker notes: ${options.generateNotes}
${guidance ? `- Additional guidance: ${guidance}` : ""}

Return a JSON object with:
{
  "title": "Presentation title",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide title",
      "content": "Main slide content (use bullet points, keep concise)",
      "layout": "title_slide|content|two_column|image_content|conclusion",
      "speakerNotes": "Detailed speaker notes if requested",
      "imagePrompt": "Description of image that would fit (if applicable)"
    }
  ],
  "totalSlides": 10,
  "estimatedDuration": "15 minutes"
}`;

    const userPrompt = `Convert this content into a presentation:

${textContent}`;

    let response: string;

    switch (llmProvider) {
      case "openai":
        response = await this.callOpenAIWithSystem(systemPrompt, userPrompt, apiKey, model);
        break;
      case "anthropic":
        response = await this.callAnthropicWithSystem(systemPrompt, userPrompt, apiKey, model);
        break;
      case "gemini":
        response = await this.callGeminiWithSystem(systemPrompt, userPrompt, apiKey, model);
        break;
      default:
        throw new Error(`Unsupported LLM provider: ${llmProvider}`);
    }

    try {
      return JSON.parse(response);
    } catch (error) {
      throw new Error(`Failed to parse slide generation response: ${error}`);
    }
  }

  private async callOpenAI(prompt: string, apiKey: string, model: string): Promise<string> {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: model || DEFAULT_OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      // Removed response_format as it's not supported with this model
    });

    return response.choices[0].message.content || "";
  }

  private async callOpenAIWithSystem(systemPrompt: string, userPrompt: string, apiKey: string, model: string): Promise<string> {
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: model || DEFAULT_OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      // Removed response_format as it's not supported with this model
    });

    return response.choices[0].message.content || "";
  }

  private async callAnthropic(prompt: string, apiKey: string, model: string): Promise<string> {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
      model: model || DEFAULT_ANTHROPIC_MODEL,
    });

    return (message.content[0] as any).text || "";
  }

  private async callAnthropicWithSystem(systemPrompt: string, userPrompt: string, apiKey: string, model: string): Promise<string> {
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      model: model || DEFAULT_ANTHROPIC_MODEL,
    });

    return (message.content[0] as any).text || "";
  }

  private async callGemini(prompt: string, apiKey: string, model: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: model || DEFAULT_GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return response.text || "";
  }

  private async callGeminiWithSystem(systemPrompt: string, userPrompt: string, apiKey: string, model: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: model || DEFAULT_GEMINI_MODEL,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
      contents: userPrompt,
    });

    return response.text || "";
  }
}

export const llmService = new LLMService();
