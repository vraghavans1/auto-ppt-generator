import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface ProcessingSectionProps {
  presentationId?: string;
}

interface PresentationStatus {
  id: string;
  status: 'processing' | 'completed' | 'error';
  slideCount?: number;
  processingTime?: number;
  resultFilePath?: string;
}

export function ProcessingSection({ presentationId }: ProcessingSectionProps) {
  const [status, setStatus] = useState<"processing" | "completed" | "error">("processing");
  const [progress, setProgress] = useState(25);
  const [currentStep, setCurrentStep] = useState("Analyzing content structure...");

  // Query for presentation status
  const { data: presentationStatus, error } = useQuery<PresentationStatus>({
    queryKey: ['/api/status', presentationId],
    enabled: !!presentationId,
    refetchInterval: status === 'processing' ? 2000 : false, // Poll every 2 seconds while processing
  });

  // Update status based on API response
  useEffect(() => {
    if (presentationStatus) {
      if (presentationStatus.status === 'completed') {
        setStatus('completed');
        setProgress(100);
        setCurrentStep('Presentation completed successfully!');
      } else if (presentationStatus.status === 'error') {
        setStatus('error');
      } else if (presentationStatus.status === 'processing') {
        // Simulate progress for processing state
        const steps = [
          { progress: 25, text: "Analyzing content structure..." },
          { progress: 50, text: "Generating slide content with LLM..." },
          { progress: 75, text: "Applying template styles..." },
          { progress: 90, text: "Finalizing presentation..." }
        ];
        const randomStep = steps[Math.floor(Math.random() * steps.length)];
        setProgress(randomStep.progress);
        setCurrentStep(randomStep.text);
      }
    }

    if (error) {
      setStatus('error');
    }
  }, [presentationStatus, error]);

  const handleDownload = () => {
    if (presentationId && status === 'completed') {
      console.log("Downloading presentation...");
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = `/api/download/${presentationId}`;
      downloadLink.download = 'generated-presentation.pptx';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handlePreview = () => {
    if (presentationId && status === 'completed') {
      // Open preview in new window/tab
      window.open(`/api/preview/${presentationId}`, '_blank');
    }
  };

  const handleStartNew = () => {
    window.location.reload();
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-success text-white rounded-lg">
          <i className="fas fa-download text-sm"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Processing & Download</h2>
      </div>

      {/* Processing Status */}
      {status === "processing" && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium text-gray-900" data-testid="text-processing-status">
              {currentStep}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            ></div>
          </div>
          
          <div className="text-xs text-secondary space-y-1">
            <div>Step {Math.ceil(progress / 25)} of 4: {currentStep}</div>
            <div className="text-xs text-gray-400">This may take a few minutes depending on content length</div>
          </div>
        </div>
      )}

      {/* Success State */}
      {status === "completed" && (
        <div>
          <div className="flex items-center space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
            <div className="flex-shrink-0">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-green-900">Presentation generated successfully!</h3>
              <p className="text-sm text-green-700 mt-1">Your PowerPoint file is ready for download</p>
            </div>
          </div>

          {/* Results Summary */}
          {presentationStatus && (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="text-slide-count">
                    {presentationStatus.slideCount || '-'}
                  </div>
                  <div className="text-sm text-secondary">Slides Created</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success" data-testid="text-images-reused">
                    -
                  </div>
                  <div className="text-sm text-secondary">Images Reused</div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning" data-testid="text-processing-time">
                    {presentationStatus.processingTime ? `${presentationStatus.processingTime}s` : '-'}
                  </div>
                  <div className="text-sm text-secondary">Processing Time</div>
                </div>
              </div>
            </div>
          )}

          {/* Download Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <i className="fas fa-file-powerpoint text-2xl text-orange-500"></i>
                <div>
                  <h4 className="font-medium text-gray-900" data-testid="text-file-name">
                    generated-presentation.pptx
                  </h4>
                  <p className="text-sm text-secondary" data-testid="text-file-size">
                    Ready for download
                  </p>
                </div>
              </div>
              <Button onClick={handleDownload} data-testid="button-download">
                <i className="fas fa-download mr-2"></i>
                Download
              </Button>
            </div>

            {/* Additional Options */}
            <div className="flex items-center justify-between text-sm">
              <div className="space-x-4">
                <button onClick={handlePreview} className="text-primary hover:text-blue-700 transition-colors" data-testid="button-preview">
                  <i className="fas fa-eye mr-1"></i>Preview Slides
                </button>
                <button className="text-secondary hover:text-gray-900 transition-colors" data-testid="button-regenerate">
                  <i className="fas fa-redo mr-1"></i>Regenerate
                </button>
              </div>
              <button 
                onClick={handleStartNew}
                className="text-secondary hover:text-gray-900 transition-colors"
                data-testid="button-start-new"
              >
                <i className="fas fa-plus mr-1"></i>Start New
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="flex items-center space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex-shrink-0">
            <i className="fas fa-exclamation-circle text-red-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-900">Processing failed</h3>
            <p className="text-sm text-red-700 mt-1">Please check your inputs and try again</p>
          </div>
          <Button variant="outline" onClick={() => setStatus("processing")}>
            <i className="fas fa-redo mr-2"></i>
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
