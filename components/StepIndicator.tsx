import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300',
                index < currentStep
                  ? 'bg-wash-blue text-primary-foreground'
                  : index === currentStep
                  ? 'bg-gradient-to-br from-wash-blue to-wash-orange text-primary-foreground shadow-glow'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              'mt-2 text-xs md:text-sm font-medium hidden md:block',
              index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-8 md:w-16 h-0.5 mx-2 transition-all duration-300',
                index < currentStep ? 'bg-wash-blue' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
};
