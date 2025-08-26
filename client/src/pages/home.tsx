import { useState } from "react";
import { ProgressSteps } from "@/components/ProgressSteps";
import { ContentInput } from "@/components/ContentInput";
import { ApiConfiguration } from "@/components/ApiConfiguration";
import { TemplateUpload } from "@/components/TemplateUpload";
import { GenerationOptions } from "@/components/GenerationOptions";
import { ProcessingSection } from "@/components/ProcessingSection";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    textContent: "",
    guidance: "",
    llmProvider: "openai" as const,
    apiKey: "",
    model: "gpt-5",
    templateFile: null as File | null,
    templateFilePath: null as string | null, // Store the uploaded file path
    options: {
      targetSlides: "auto" as const,
      presentationStyle: "professional" as const,
      contentDensity: "balanced" as const,
      generateNotes: "auto" as const,
      reuseImages: true,
      preserveLayouts: true,
      matchFonts: true,
    }
  });

  const updateFormData = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const updateOptions = (options: any) => {
    setFormData(prev => ({ ...prev, options: { ...prev.options, ...options } }));
  };

  const canProceedToStep2 = formData.textContent.length >= 100;
  const canProceedToStep3 = canProceedToStep2 && formData.apiKey.trim().length > 0;

  return (
    <div className="bg-background font-sans min-h-screen">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <i className="fas fa-presentation text-primary text-2xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Auto PPT Generator</h1>
                <p className="text-sm text-secondary">Transform text into beautiful presentations</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-secondary hover:text-gray-900 transition-colors" data-testid="button-help">
                <i className="fas fa-question-circle text-lg"></i>
              </button>
              <button className="text-secondary hover:text-gray-900 transition-colors" data-testid="button-github">
                <i className="fab fa-github text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-12">
          <ProgressSteps currentStep={currentStep} />
        </div>

        {/* Step 1: Content Input */}
        <ContentInput 
          textContent={formData.textContent}
          guidance={formData.guidance}
          onChange={updateFormData}
          onNext={() => canProceedToStep2 && setCurrentStep(2)}
          canProceed={canProceedToStep2}
        />

        {/* Step 2: API & Template Configuration - Always visible */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <ApiConfiguration
            llmProvider={formData.llmProvider}
            apiKey={formData.apiKey}
            model={formData.model}
            onChange={updateFormData}
          />
          <TemplateUpload
            templateFile={formData.templateFile}
            onChange={updateFormData}
          />
        </div>

        {/* Step 3: Generation Options - Always visible */}
        <GenerationOptions
          options={formData.options}
          onChange={updateOptions}
          onGenerate={(id: string) => {
            setPresentationId(id);
            setCurrentStep(4);
          }}
          canGenerate={canProceedToStep3}
          formData={formData}
          textContent={formData.textContent}
          apiKey={formData.apiKey}
        />

        {/* Step 4: Processing & Results */}
        {currentStep >= 4 && (
          <ProcessingSection presentationId={presentationId || undefined} />
        )}



        {/* Footer Information */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Supported Formats</h4>
              <ul className="space-y-1 text-secondary">
                <li><i className="fas fa-check text-green-500 mr-2"></i>PowerPoint (.pptx)</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>PowerPoint Template (.potx)</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Markdown text</li>
                <li><i className="fas fa-check text-green-500 mr-2"></i>Plain text</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">LLM Providers</h4>
              <ul className="space-y-1 text-secondary">
                <li><i className="fas fa-robot text-blue-500 mr-2"></i>OpenAI GPT Models</li>
                <li><i className="fas fa-brain text-orange-500 mr-2"></i>Anthropic Claude</li>
                <li><i className="fas fa-gem text-green-500 mr-2"></i>Google Gemini</li>
                <li><i className="fas fa-plus text-gray-400 mr-2"></i>More coming soon</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Privacy & Security</h4>
              <ul className="space-y-1 text-secondary">
                <li><i className="fas fa-shield-alt text-green-500 mr-2"></i>API keys not stored</li>
                <li><i className="fas fa-trash text-blue-500 mr-2"></i>Files deleted after processing</li>
                <li><i className="fas fa-lock text-purple-500 mr-2"></i>Secure HTTPS connection</li>
                <li><i className="fas fa-user-shield text-gray-500 mr-2"></i>No user tracking</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
              <ul className="space-y-1 text-secondary">
                <li><a href="#" className="hover:text-primary transition-colors"><i className="fas fa-book mr-2"></i>Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors"><i className="fab fa-github mr-2"></i>GitHub Repository</a></li>
                <li><a href="#" className="hover:text-primary transition-colors"><i className="fas fa-question-circle mr-2"></i>FAQ</a></li>
                <li><a href="#" className="hover:text-primary transition-colors"><i className="fas fa-envelope mr-2"></i>Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-secondary">
            <p>© 2024 Auto PPT Generator. Open source under MIT License.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
