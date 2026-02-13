'use client';

const STEPS = ['Goal', 'Template', 'Inputs', 'Advanced', 'Review'];

export default function WizardProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const completed = currentStep > stepNumber;
          const active = currentStep === stepNumber;
          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                  completed
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : 'bg-border text-gray-400'
                }`}
              >
                {completed ? '✓' : stepNumber}
              </div>
              <span className={`text-xs font-bold ${active ? 'text-primary' : 'text-gray-400'}`}>{label}</span>
              {stepNumber < STEPS.length && <div className={`w-6 h-0.5 ${completed ? 'bg-emerald-500' : 'bg-border'}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
