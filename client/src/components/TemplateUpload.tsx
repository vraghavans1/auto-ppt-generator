import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TemplateUploadProps {
  templateFile: File | null;
  onChange: (updates: { templateFile?: File | null; templateFilePath?: string | null }) => void;
}

interface TemplateAnalysis {
  slideCount: number;
  imageCount: number;
  layoutCount: number;
  colors: string[];
}

export function TemplateUpload({ templateFile, onChange }: TemplateUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<TemplateAnalysis | null>(null);
  const [options, setOptions] = useState({
    reuseImages: true,
    preserveLayouts: true,
    matchFonts: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.presentationml.template'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .pptx or .potx file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('template', file);

      const response = await fetch('/api/upload-template', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      onChange({ 
        templateFile: file,
        templateFilePath: result.path // Store the uploaded file path
      });
      setAnalysis(result.analysis);
      
      toast({
        title: "Template uploaded",
        description: `Successfully analyzed ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload template",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeTemplate = () => {
    onChange({ 
      templateFile: null,
      templateFilePath: null
    });
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-success text-white rounded-lg">
          <i className="fas fa-file-powerpoint text-sm"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">PowerPoint Template</h2>
      </div>

      {/* File Upload Zone */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Upload your template file</label>
        
        {!templateFile ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={triggerFileSelect}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            data-testid="drop-zone-template"
          >
            <div className="space-y-2">
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-3xl text-primary"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Uploading...</p>
                    <p className="text-xs text-secondary">Please wait while we analyze your template</p>
                  </div>
                </>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt text-3xl text-secondary"></i>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Drop your PowerPoint file here</p>
                    <p className="text-xs text-secondary">or click to browse</p>
                  </div>
                  <p className="text-xs text-secondary">Supports .pptx and .potx files (max 50MB)</p>
                </>
              )}
            </div>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".pptx,.potx"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              data-testid="input-template-file"
            />
          </div>
        ) : (
          /* Template Preview */
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <i className="fas fa-file-powerpoint text-lg text-orange-500"></i>
                <div>
                  <p className="text-sm font-medium text-gray-900" data-testid="text-template-name">
                    {templateFile.name}
                  </p>
                  <p className="text-xs text-secondary" data-testid="text-template-size">
                    {(templateFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={removeTemplate}
                data-testid="button-remove-template"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
            
            {analysis && (
              <>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Slides found</span>
                    <span className="font-medium" data-testid="text-slide-count">{analysis.slideCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Images detected</span>
                    <span className="font-medium" data-testid="text-image-count">{analysis.imageCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-secondary">Master layouts</span>
                    <span className="font-medium" data-testid="text-layout-count">{analysis.layoutCount}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Style Preview</h4>
                  <div className="flex space-x-2">
                    {analysis.colors.map((color, index) => (
                      <div 
                        key={index}
                        className="w-4 h-4 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={`Color ${index + 1}: ${color}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Template Options */}
      {templateFile && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="reuse-images" 
              checked={options.reuseImages}
              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, reuseImages: !!checked }))}
              data-testid="checkbox-reuse-images"
            />
            <label htmlFor="reuse-images" className="text-sm text-gray-700">
              Reuse template images where appropriate
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="preserve-layouts" 
              checked={options.preserveLayouts}
              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preserveLayouts: !!checked }))}
              data-testid="checkbox-preserve-layouts"
            />
            <label htmlFor="preserve-layouts" className="text-sm text-gray-700">
              Preserve original slide layouts
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="match-fonts" 
              checked={options.matchFonts}
              onCheckedChange={(checked) => setOptions(prev => ({ ...prev, matchFonts: !!checked }))}
              data-testid="checkbox-match-fonts"
            />
            <label htmlFor="match-fonts" className="text-sm text-gray-700">
              Match template fonts and styles
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
