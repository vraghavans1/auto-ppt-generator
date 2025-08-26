import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGeneration } from "@/hooks/useGeneration";

interface GenerationOptionsProps {
  options: {
    targetSlides: string;
    presentationStyle: string;
    contentDensity: string;
    generateNotes: string;
  };
  onChange: (options: any) => void;
  onGenerate: (presentationId: string) => void;
  canGenerate: boolean;
  formData: any;
  textContent: string;
  apiKey: string;
}

export function GenerationOptions({ options, onChange, onGenerate, canGenerate, formData, textContent, apiKey }: GenerationOptionsProps) {
  const { generatePresentation, isLoading } = useGeneration();

  const handleGenerate = async () => {
    // Validate all required fields and show specific error messages
    if (textContent.length < 100) {
      alert("❌ Please enter at least 100 characters of text content in Step 1 before generating.");
      return;
    }
    
    if (!apiKey || apiKey.trim().length === 0) {
      alert("❌ Please enter your LLM API key in Step 2 before generating.");
      return;
    }

    if (isLoading) {
      alert("❌ Generation is already in progress. Please wait...");
      return;
    }

    try {
      const result = await generatePresentation(formData);
      if (result?.presentationId) {
        onGenerate(result.presentationId);
      }
    } catch (error) {
      console.error("Generation failed:", error);
      alert("❌ Generation failed. Please check your inputs and try again.");
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6 mb-12">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-lg">
          <i className="fas fa-magic text-sm"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Generation Options</h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Slide Count */}
        <div>
          <label htmlFor="slide-count" className="block text-sm font-medium text-gray-700 mb-2">Target slide count</label>
          <Select value={options.targetSlides} onValueChange={(value) => onChange({ targetSlides: value })}>
            <SelectTrigger data-testid="select-target-slides">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Recommended)</SelectItem>
              <SelectItem value="5">~5 slides</SelectItem>
              <SelectItem value="10">~10 slides</SelectItem>
              <SelectItem value="15">~15 slides</SelectItem>
              <SelectItem value="20">~20 slides</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Presentation Style */}
        <div>
          <label htmlFor="presentation-style" className="block text-sm font-medium text-gray-700 mb-2">Presentation style</label>
          <Select value={options.presentationStyle} onValueChange={(value) => onChange({ presentationStyle: value })}>
            <SelectTrigger data-testid="select-presentation-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="visual-heavy">Visual Heavy</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="pitch">Investor Pitch</SelectItem>
              <SelectItem value="educational">Educational</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Density */}
        <div>
          <label htmlFor="content-density" className="block text-sm font-medium text-gray-700 mb-2">Content density</label>
          <Select value={options.contentDensity} onValueChange={(value) => onChange({ contentDensity: value })}>
            <SelectTrigger data-testid="select-content-density">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="balanced">Balanced</SelectItem>
              <SelectItem value="concise">Concise</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
              <SelectItem value="bullet-heavy">Bullet Points</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Speaker Notes */}
        <div>
          <label htmlFor="speaker-notes" className="block text-sm font-medium text-gray-700 mb-2">Speaker notes</label>
          <Select value={options.generateNotes} onValueChange={(value) => onChange({ generateNotes: value })}>
            <SelectTrigger data-testid="select-speaker-notes">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-generate</SelectItem>
              <SelectItem value="detailed">Detailed notes</SelectItem>
              <SelectItem value="brief">Brief notes</SelectItem>
              <SelectItem value="none">No notes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-center pt-6">
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading}
            size="lg"
            className="px-8"
            data-testid="button-generate"
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Generate Presentation
              </>
            )}
          </Button>
        </div>
        
        {/* Status indicators */}
        <div className="mt-4 text-sm text-gray-600 text-center">
          <div className="flex items-center justify-center space-x-6">
            <span className={textContent.length >= 100 ? "text-green-600" : "text-gray-400"}>
              <i className={`fas ${textContent.length >= 100 ? "fa-check" : "fa-circle"} mr-1`}></i>
              Text Content ({textContent.length}/100)
            </span>
            <span className={apiKey.trim().length > 0 ? "text-green-600" : "text-gray-400"}>
              <i className={`fas ${apiKey.trim().length > 0 ? "fa-check" : "fa-circle"} mr-1`}></i>
              API Key
            </span>
            <span className={formData.templateFile ? "text-green-600" : "text-yellow-600"}>
              <i className={`fas ${formData.templateFile ? "fa-check" : "fa-circle"} mr-1`}></i>
              Template (Optional)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
