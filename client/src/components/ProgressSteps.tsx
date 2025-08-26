interface ProgressStepsProps {
  currentStep: number;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, title: "Input Content" },
    { number: 2, title: "API & Template" },
    { number: 3, title: "Generate" },
    { number: 4, title: "Download" },
  ];

  return (
    <div className="flex items-center justify-between max-w-4xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  currentStep >= step.number
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
                data-testid={`step-${step.number}`}
              >
                {step.number}
              </div>
              <span
                className={`ml-3 text-sm font-medium ${
                  currentStep >= step.number ? "text-gray-900" : "text-secondary"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-4 w-16"></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
