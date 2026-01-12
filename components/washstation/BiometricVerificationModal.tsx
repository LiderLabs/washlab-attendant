'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import BiometricCapture from '@/components/auth/BiometricCapture';
import { Loader2, AlertCircle, Shield } from 'lucide-react';

interface BiometricVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (biometricData: {
    captureType: 'face' | 'hand';
    features: string;
    measurements: string;
    livenessData: string;
    angles: string[];
    captureQuality: number;
    deviceInfo?: string;
  }) => void;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export function BiometricVerificationModal({
  open,
  onClose,
  onComplete,
  title = 'Verify Identity',
  description = 'Please verify your identity to continue',
  isLoading = false,
}: BiometricVerificationModalProps) {
  const [step, setStep] = useState<'ready' | 'capturing' | 'complete'>('ready');
  const [error, setError] = useState<string | null>(null);

  const handleCaptureComplete = (biometricData: any) => {
    setStep('complete');
    setError(null);
    onComplete({
      captureType: biometricData.captureType || 'face',
      features: biometricData.features,
      measurements: biometricData.measurements,
      livenessData: biometricData.livenessData,
      angles: biometricData.angles || [],
      captureQuality: biometricData.captureQuality || 0.95,
      deviceInfo: JSON.stringify({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      }),
    });
  };

  const handleCancel = () => {
    setStep('ready');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && step === 'complete' ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Verifying identity...</p>
          </div>
        ) : (
          <BiometricCapture
            onComplete={handleCaptureComplete}
            onCancel={handleCancel}
            method="face"
            mode="verification"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
