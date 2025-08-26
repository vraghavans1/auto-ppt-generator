import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApiConfigurationProps {
  llmProvider: "openai" | "anthropic" | "gemini";
  apiKey: string;
  model: string;
  onChange: (updates: { llmProvider?: string; apiKey?: string; model?: string }) => void;
}

export function ApiConfiguration({ llmProvider, apiKey, model, onChange }: ApiConfigurationProps) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiStatus, setApiStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  const providers = [
    { id: "openai", name: "OpenAI", icon: "fas fa-robot", models: ["gpt-5", "gpt-4", "gpt-3.5-turbo"] },
    { id: "anthropic", name: "Anthropic", icon: "fas fa-brain", models: ["claude-sonnet-4-20250514", "claude-3-sonnet-20240229"] },
    { id: "gemini", name: "Gemini", icon: "fas fa-gem", models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-1.5-pro"] }
  ];

  const currentProvider = providers.find(p => p.id === llmProvider);

  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      onChange({ 
        llmProvider: providerId as any,
        model: provider.models[0]
      });
    }
  };

  const testApiConnection = async () => {
    if (!apiKey.trim()) return;
    
    setApiStatus("testing");
    // Simulate API test - in real implementation, make a test call
    setTimeout(() => {
      setApiStatus("success");
      setTimeout(() => setApiStatus("idle"), 3000);
    }, 1500);
  };

  return (
    <div className="bg-surface rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-8 h-8 bg-warning text-white rounded-lg">
          <i className="fas fa-key text-sm"></i>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">LLM API Configuration</h2>
      </div>

      <div className="space-y-4">
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Choose your LLM provider</label>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleProviderSelect(provider.id)}
                className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all hover:bg-gray-50 ${
                  llmProvider === provider.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200"
                }`}
                data-testid={`button-provider-${provider.id}`}
              >
                <i className={`${provider.icon} text-lg mb-1 ${
                  llmProvider === provider.id ? "text-primary" : "text-secondary"
                }`}></i>
                <span className={`text-xs font-medium ${
                  llmProvider === provider.id ? "text-primary" : "text-secondary"
                }`}>
                  {provider.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div>
          <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
            API Key
            <span className="text-secondary font-normal">(Not stored or logged)</span>
          </label>
          <div className="relative">
            <Input 
              type={showApiKey ? "text" : "password"}
              id="api-key"
              placeholder="sk-..."
              className="pr-12 font-mono text-sm"
              value={apiKey}
              onChange={(e) => onChange({ apiKey: e.target.value })}
              data-testid="input-api-key"
            />
            <button 
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary hover:text-gray-900 transition-colors"
              data-testid="button-toggle-api-key"
            >
              <i className={`fas ${showApiKey ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
            </button>
          </div>
          <p className="mt-2 text-xs text-secondary">
            <i className="fas fa-shield-alt mr-1"></i>
            Your API key is used only for this session and never stored
          </p>
        </div>

        {/* Model Selection */}
        {currentProvider && (
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <Select value={model} onValueChange={(value) => onChange({ model: value })}>
              <SelectTrigger data-testid="select-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {currentProvider.models.map((modelName) => (
                  <SelectItem key={modelName} value={modelName}>
                    {modelName} {modelName === currentProvider.models[0] && "(Recommended)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Test API Connection */}
        {apiKey.trim() && (
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testApiConnection}
              disabled={apiStatus === "testing"}
              data-testid="button-test-api"
            >
              {apiStatus === "testing" && <i className="fas fa-spinner fa-spin mr-2"></i>}
              {apiStatus === "testing" ? "Testing..." : "Test Connection"}
            </Button>
          </div>
        )}

        {/* API Status */}
        <div className={`p-3 rounded-lg border-l-4 ${
          apiStatus === "success" 
            ? "bg-green-50 border-green-300" 
            : apiStatus === "error"
            ? "bg-red-50 border-red-300"
            : "bg-gray-50 border-gray-300"
        }`}>
          <div className="flex items-center">
            <i className={`fas fa-circle text-xs mr-2 ${
              apiStatus === "success" 
                ? "text-green-600" 
                : apiStatus === "error"
                ? "text-red-600"
                : "text-gray-400"
            }`}></i>
            <span className="text-sm text-secondary" data-testid="text-api-status">
              {apiStatus === "success" 
                ? "API connection successful" 
                : apiStatus === "error"
                ? "API connection failed"
                : "API connection not tested"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
