import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ContentInputProps {
  textContent: string;
  guidance: string;
  onChange: (updates: { textContent?: string; guidance?: string }) => void;
  onNext: () => void;
  canProceed: boolean;
}

export function ContentInput({ textContent, guidance, onChange, onNext, canProceed }: ContentInputProps) {
  const [analysis, setAnalysis] = useState({
    estimatedSlides: 0,
    contentType: "-",
    readingTime: "-",
    structure: "-",
    sections: [] as string[],
  });

  const handleClear = () => {
    onChange({ textContent: "", guidance: "" });
  };

  const handleLoadExample = () => {
    const exampleContent = `# AI in Healthcare
The healthcare industry is experiencing a revolutionary transformation through artificial intelligence...

## Key Benefits
- Improved diagnostic accuracy
- Reduced treatment costs
- Enhanced patient outcomes

## Implementation Challenges
- Data privacy concerns
- Integration with existing systems
- Training requirements for medical staff

## Future Outlook
AI will continue to reshape healthcare delivery, making it more personalized, efficient, and accessible to patients worldwide.`;

    onChange({ 
      textContent: exampleContent,
      guidance: "Create a professional presentation for healthcare executives"
    });
  };

  // Auto-analyze content when it changes
  useEffect(() => {
    if (textContent.length >= 100) {
      // Simple analysis based on content
      const words = textContent.split(/\s+/).length;
      const estimatedSlides = Math.max(3, Math.min(20, Math.ceil(words / 100)));
      const readingTime = Math.ceil(words / 200);
      
      // Detect sections
      const sections = textContent.match(/^#+\s+(.+)$/gm) || [];
      const sectionTitles = sections.map(s => s.replace(/^#+\s+/, "")).slice(0, 5);

      setAnalysis({
        estimatedSlides,
        contentType: sectionTitles.length > 0 ? "Structured Document" : "Prose",
        readingTime: `${readingTime} min read`,
        structure: sectionTitles.length > 2 ? "Hierarchical" : "Sequential",
        sections: sectionTitles,
      });
    } else {
      setAnalysis({
        estimatedSlides: 0,
        contentType: "-",
        readingTime: "-",
        structure: "-",
        sections: [],
      });
    }
  }, [textContent]);

  return (
    <div className="grid lg:grid-cols-3 gap-8 mb-12">
      <div className="lg:col-span-2">
        <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-lg">
              <i className="fas fa-edit text-sm"></i>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Input Your Content</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="content-input" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your text content
                <span className="text-secondary font-normal">(Markdown supported)</span>
              </label>
              <Textarea 
                id="content-input"
                placeholder="Paste your large block of text here. This can be markdown, prose, research notes, meeting transcripts, or any content you want to transform into a presentation.

Example:
# AI in Healthcare
The healthcare industry is experiencing a revolutionary transformation through artificial intelligence...

## Key Benefits
- Improved diagnostic accuracy
- Reduced treatment costs
- Enhanced patient outcomes"
                className="w-full h-64 text-sm resize-none"
                value={textContent}
                onChange={(e) => onChange({ textContent: e.target.value })}
                data-testid="input-content"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-secondary" data-testid="text-content-length">
                  {textContent.length} characters
                </span>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClear}
                    data-testid="button-clear"
                  >
                    <i className="fas fa-trash mr-1"></i>Clear
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLoadExample}
                    data-testid="button-example"
                  >
                    <i className="fas fa-lightbulb mr-1"></i>Load Example
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="guidance-input" className="block text-sm font-medium text-gray-700 mb-2">
                Presentation guidance
                <span className="text-secondary font-normal">(Optional)</span>
              </label>
              <Input 
                type="text" 
                id="guidance-input"
                placeholder="e.g., 'investor pitch deck', 'technical walkthrough', 'sales presentation'"
                value={guidance}
                onChange={(e) => onChange({ guidance: e.target.value })}
                data-testid="input-guidance"
              />
              <p className="mt-2 text-xs text-secondary">
                Provide context about the type of presentation you want to create
              </p>
            </div>


          </div>
        </div>
      </div>

      {/* Content Analysis Panel */}
      <div className="lg:col-span-1">
        <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analysis</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Estimated Slides</span>
                <span className="text-lg font-bold text-primary" data-testid="text-estimated-slides">
                  {analysis.estimatedSlides || "-"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, (analysis.estimatedSlides / 20) * 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Content Type</span>
                <span className="text-sm font-medium" data-testid="text-content-type">{analysis.contentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Reading Time</span>
                <span className="text-sm font-medium" data-testid="text-reading-time">{analysis.readingTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-secondary">Structure</span>
                <span className="text-sm font-medium" data-testid="text-structure">{analysis.structure}</span>
              </div>
            </div>

            {analysis.sections.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Detected Sections</h4>
                <div className="space-y-1">
                  {analysis.sections.map((section, index) => (
                    <div key={index} className="text-xs text-secondary">
                      <i className="fas fa-chevron-right mr-1"></i>{section}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
