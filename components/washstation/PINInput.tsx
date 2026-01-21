'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PINInputProps {
  onComplete: (pin: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  error?: string;
  length?: number;
}

/**
 * PIN Input Component
 * Displays a secure PIN input with individual digit boxes
 */
export function PINInput({
  onComplete,
  onCancel,
  title = "Enter PIN",
  description = "Enter your 6-digit PIN to continue",
  error,
  length = 6,
}: PINInputProps) {
  const [pin, setPin] = useState<string[]>(Array(length).fill(''));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Check if all digits are filled
    if (newPin.every(digit => digit !== '') && newPin.join('').length === length) {
      onComplete(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      const newPin = pastedData.split('').slice(0, length);
      const paddedPin = [...newPin, ...Array(length - newPin.length).fill('')];
      setPin(paddedPin);
      
      // Focus the next empty input or the last one
      const nextEmptyIndex = paddedPin.findIndex(d => d === '');
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
      inputRefs.current[focusIndex]?.focus();
      setFocusedIndex(focusIndex);

      // If all digits filled, complete
      if (pastedData.length === length) {
        onComplete(pastedData);
      }
    }
  };

  const clearPIN = () => {
    setPin(Array(length).fill(''));
    setFocusedIndex(0);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex justify-center gap-2">
        {pin.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            className="w-12 h-14 text-center text-2xl font-semibold"
            autoComplete="off"
          />
        ))}
      </div>

      {error && (
        <div className="text-sm text-destructive text-center">{error}</div>
      )}

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={clearPIN}
          className="text-xs"
        >
          Clear
        </Button>
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-xs"
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
