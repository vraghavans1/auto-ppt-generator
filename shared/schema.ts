import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const presentations = pgTable("presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  originalText: text("original_text").notNull(),
  guidance: text("guidance"),
  llmProvider: varchar("llm_provider", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  templateFileName: text("template_file_name"),
  templateData: jsonb("template_data"),
  generatedSlides: jsonb("generated_slides"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  resultFilePath: text("result_file_path"),
  slideCount: integer("slide_count"),
  processingTime: integer("processing_time"), // in seconds
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPresentationSchema = createInsertSchema(presentations).omit({
  id: true,
  createdAt: true,
});

export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
export type Presentation = typeof presentations.$inferSelect;

// Generation request schema
export const generationRequestSchema = z.object({
  textContent: z.string().min(100, "Content must be at least 100 characters"),
  guidance: z.string().optional(),
  llmProvider: z.enum(["openai", "anthropic", "gemini"]),
  apiKey: z.string().min(1, "API key is required"),
  model: z.string().min(1, "Model is required"),
  templateFile: z.string().optional(),
  options: z.object({
    targetSlides: z.union([z.literal("auto"), z.string()]),
    presentationStyle: z.enum(["professional", "visual-heavy", "technical", "pitch", "educational"]),
    contentDensity: z.enum(["balanced", "concise", "detailed", "bullet-heavy"]),
    generateNotes: z.enum(["auto", "detailed", "brief", "none"]),
    reuseImages: z.boolean().default(true),
    preserveLayouts: z.boolean().default(true),
    matchFonts: z.boolean().default(true),
  }),
});

export type GenerationRequest = z.infer<typeof generationRequestSchema>;

// Analysis result schema
export const analysisResultSchema = z.object({
  estimatedSlides: z.number(),
  contentType: z.string(),
  readingTime: z.string(),
  structure: z.string(),
  sections: z.array(z.string()),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;
