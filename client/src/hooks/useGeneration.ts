import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useGeneration() {
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (formData: any) => {
      // Prepare the request data by using the uploaded file path
      const requestData = {
        textContent: formData.textContent,
        guidance: formData.guidance,
        llmProvider: formData.llmProvider,
        apiKey: formData.apiKey,
        model: formData.model,
        templateFile: formData.templateFilePath || undefined, // Use the uploaded file path
        options: formData.options
      };
      
      const response = await apiRequest("POST", "/api/generate", requestData);
      return response.json();
    },
    onSuccess: (data) => {
      setPresentationId(data.presentationId);
      toast({
        title: "Generation started",
        description: "Your presentation is being generated...",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to start generation",
        variant: "destructive"
      });
    }
  });

  const generatePresentation = async (formData: any) => {
    return generateMutation.mutateAsync(formData);
  };

  return {
    generatePresentation,
    isLoading: generateMutation.isPending,
    error: generateMutation.error,
    presentationId,
  };
}
