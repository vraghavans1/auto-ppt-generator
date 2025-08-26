import { type Presentation, type InsertPresentation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
  getPresentation(id: string): Promise<Presentation | undefined>;
  updatePresentation(id: string, updates: Partial<Presentation>): Promise<Presentation | undefined>;
  deletePresentation(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private presentations: Map<string, Presentation>;

  constructor() {
    this.presentations = new Map();
  }

  async createPresentation(insertPresentation: InsertPresentation): Promise<Presentation> {
    const id = randomUUID();
    const presentation: Presentation = {
      ...insertPresentation,
      id,
      status: insertPresentation.status || "pending",
      guidance: insertPresentation.guidance || null,
      templateFileName: insertPresentation.templateFileName || null,
      templateData: insertPresentation.templateData || null,
      generatedSlides: insertPresentation.generatedSlides || null,
      resultFilePath: insertPresentation.resultFilePath || null,
      slideCount: insertPresentation.slideCount || null,
      processingTime: insertPresentation.processingTime || null,
      createdAt: new Date(),
    };
    this.presentations.set(id, presentation);
    return presentation;
  }

  async getPresentation(id: string): Promise<Presentation | undefined> {
    return this.presentations.get(id);
  }

  async updatePresentation(id: string, updates: Partial<Presentation>): Promise<Presentation | undefined> {
    const existing = this.presentations.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...updates };
    this.presentations.set(id, updated);
    return updated;
  }

  async deletePresentation(id: string): Promise<boolean> {
    return this.presentations.delete(id);
  }
}

export const storage = new MemStorage();
