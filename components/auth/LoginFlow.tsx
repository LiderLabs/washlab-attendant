'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import BiometricCapture from './BiometricCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, Mail, Fingerprint, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LoginFlowProps {
  branchId: Id<'branches'>;
  onSuccess: () => void;
  onBack?: () => void;
}

type LoginStep = 'email-entry' | 'auth-method' | 'pin-password' | 'biometric-verifying' | 'biometric-capturing' | 'error';

export function LoginFlow({ branchId, onSuccess, onBack }: LoginFlowProps) {
  const [step, setStep] = useState<LoginStep>('email-entry');
  const [email, setEmail] = useState('');
  const [attendantId, setAttendantId] = useState<Id<'attendants'> | null>(null);
  const [attendantInfo, setAttendantInfo] = useState<any>(null);
  const [authMethod, setAuthMethod] = useState<'pin' | 'password' | 'biometric'>('pin');
  const [pinPassword, setPinPassword] = useState('');
  const [challenge, setChallenge] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const findAttendant = useQuery(
    api.attendants.findByEmail,
    email && step === 'email-entry' ? { email } : 'skip'
  );

  const authenticatePinPassword = useMutation(api.attendants.authenticateWithPinOrPassword);
  const startVerification = useMutation(api.attendants.startVerification);
  const verifyBiometric = useMutation(api.attendants.verifyBiometric);
  const createSession = useMutation(api.attendants.createSession);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Wait for the query result
    if (findAttendant === undefined) {
      return; // Still loading
    }

    if (!findAttendant) {
      setError('Attendant not found. Please check your email.');
      return;
    }

    // Verify branch assignment
    if (findAttendant.branchId !== branchId) {
      setError('Attendant is not assigned to this branch.');
      return;
    }

    setAttendantId(findAttendant.id);
    setAttendantInfo(findAttendant);
    setStep('auth-method');
  };

  const handleAuthMethodSelect = (method: 'pin' | 'password' | 'biometric') => {
    setAuthMethod(method);
    setError(null);

    if (method === 'biometric') {
      // Start biometric verification
      setStep('biometric-verifying');
      handleStartBiometricVerification();
    } else {
      // Show PIN/password input
      setStep('pin-password');
    }
  };

  const handleStartBiometricVerification = async () => {
    if (!attendantId) {
      setError('Missing attendant ID');
      setStep('error');
      return;
    }

    try {
      const result = await startVerification({
        attendantId,
        verificationType: 'login',
      });
      setChallenge(result.challenge);
      setStep('biometric-capturing');
    } catch (err: any) {
      setError(err.message || 'Failed to start verification');
      setStep('error');
      toast({
        title: 'Verification Failed',
        description: err.message || 'Failed to start biometric verification',
        variant: 'destructive',
      });
    }
  };

  const handlePinPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pinPassword.trim()) {
      setError(`${authMethod === 'pin' ? 'PIN' : 'Password'} is required`);
      return;
    }

    // Validate PIN format
    if (authMethod === 'pin') {
      if (pinPassword.length < 4 || pinPassword.length > 6) {
        setError('PIN must be between 4 and 6 digits');
        return;
      }
      if (!/^\d+$/.test(pinPassword)) {
        setError('PIN must contain only numbers');
        return;
      }
    }

    // Validate password format
    if (authMethod === 'password') {
      if (pinPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    if (!attendantId) {
      setError('Missing attendant ID');
      return;
    }

    try {
      const result = await authenticatePinPassword({
        attendantId,
        pinOrPassword: pinPassword,
        isPin: authMethod === 'pin',
        branchId,
        deviceInfo: JSON.stringify({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        }),
      });

      if (result.success) {
        // Create session after successful authentication
        await handleCreateSession(result.attendantId);
      }
    } catch (err: any) {
      setError(err.message || `Invalid ${authMethod === 'pin' ? 'PIN' : 'password'}`);
      toast({
        title: 'Authentication Failed',
        description: err.message || `Invalid ${authMethod === 'pin' ? 'PIN' : 'password'}`,
        variant: 'destructive',
      });
    }
  };

  const handleCreateSession = async (id: Id<'attendants'>) => {
    try {
      const sessionResult = await createSession({
        attendantId: id,
        deviceInfo: JSON.stringify({
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        }),
      });

      if (sessionResult.success) {
        // Store session tokens
        localStorage.setItem('attendant_session_token', sessionResult.sessionToken);
        localStorage.setItem('attendant_refresh_token', sessionResult.refreshToken);
        localStorage.setItem('attendant_id', id);

        toast({
          title: 'Login Successful',
          description: 'Welcome back!',
        });

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
      toast({
        title: 'Session Creation Failed',
        description: err.message || 'Failed to create session',
        variant: 'destructive',
      });
    }
  };

  const handleCaptureComplete = async (biometricData: {
    captureType: 'face' | 'hand';
    angles: string[];
    features: string;
    measurements: string;
    livenessData: string;
    captureQuality: number;
    deviceInfo?: string;
  }) => {
    if (!challenge || !attendantId) {
      setError('Missing challenge or attendant ID');
      setStep('error');
      return;
    }

    try {
      const verificationResult = await verifyBiometric({
        attendantId,
        challenge,
        verificationType: 'login',
        biometricData,
      });

      if (verificationResult.success) {
        // Create session
        await handleCreateSession(attendantId);
      }
    } catch (err: any) {
      setError(err.message || 'Biometric verification failed');
      toast({
        title: 'Verification Failed',
        description: err.message || 'Biometric verification failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (step === 'error') {
    return (
      <Card className="p-6 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || 'An error occurred during login'}</AlertDescription>
        </Alert>
        <Button
          onClick={() => {
            setStep('email-entry');
            setError(null);
            setChallenge(null);
            setAttendantId(null);
            setEmail('');
          }}
          className="w-full"
        >
          Try Again
        </Button>
      </Card>
    );
  }

  if (step === 'email-entry') {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
              autoFocus
            />
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={findAttendant === undefined}>
            {findAttendant === undefined ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </form>
    );
  }

  if (step === 'auth-method' && attendantInfo) {
    const availableMethods = [];
    if (attendantInfo.hasPin) availableMethods.push({ id: 'pin', label: 'PIN', icon: Lock });
    if (attendantInfo.hasPassword) availableMethods.push({ id: 'password', label: 'Password', icon: Lock });
    if (attendantInfo.hasBiometric) availableMethods.push({ id: 'biometric', label: 'Face Recognition', icon: Fingerprint });

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Welcome, {attendantInfo.name}</h3>
          <p className="text-sm text-muted-foreground">
            Choose your authentication method
          </p>
        </div>

        {availableMethods.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No authentication methods configured. Please contact administrator.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {availableMethods.map((method) => {
              const Icon = method.icon;
              return (
                <Card
                  key={method.id}
                  className="p-4 cursor-pointer hover:border-primary transition-colors border-2"
                  onClick={() => handleAuthMethodSelect(method.id as 'pin' | 'password' | 'biometric')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{method.label}</h4>
                      <p className="text-xs text-muted-foreground">
                        {method.id === 'pin' && 'Use your 4-6 digit PIN'}
                        {method.id === 'password' && 'Use your password'}
                        {method.id === 'biometric' && 'Use face recognition'}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Button
          variant="outline"
          onClick={() => {
            setStep('email-entry');
            setAttendantId(null);
            setAttendantInfo(null);
            setEmail('');
          }}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Email
        </Button>
      </div>
    );
  }

  if (step === 'pin-password') {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">
            {authMethod === 'pin' ? 'Enter Your PIN' : 'Enter Your Password'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {authMethod === 'pin'
              ? 'Please enter your 4-6 digit PIN to continue'
              : 'Please enter your password to continue'}
          </p>
        </div>

        <form onSubmit={handlePinPasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pinPassword" className="text-sm font-medium">
              {authMethod === 'pin' ? 'PIN' : 'Password'}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="pinPassword"
                type={authMethod === 'password' ? 'password' : 'text'}
                inputMode={authMethod === 'pin' ? 'numeric' : 'text'}
                placeholder={authMethod === 'pin' ? '0000' : 'Enter your password'}
                value={pinPassword}
                onChange={(e) => {
                  const value = authMethod === 'pin' 
                    ? e.target.value.replace(/[^0-9]/g, '')
                    : e.target.value;
                  setPinPassword(value);
                }}
                className={`pl-10 text-center ${authMethod === 'pin' ? 'text-lg font-mono tracking-widest' : 'text-base'}`}
                maxLength={authMethod === 'pin' ? 6 : undefined}
                minLength={authMethod === 'pin' ? 4 : undefined}
                autoFocus
                required
              />
            </div>
            {authMethod === 'pin' && (
              <p className="text-xs text-muted-foreground text-center">
                4-6 digits required
              </p>
            )}
            {authMethod === 'password' && (
              <p className="text-xs text-muted-foreground text-center">
                Minimum 6 characters
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={!pinPassword.trim() || (authMethod === 'pin' && (pinPassword.length < 4 || pinPassword.length > 6))}
          >
            Sign In
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setStep('auth-method');
              setPinPassword('');
              setError(null);
            }}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Methods
          </Button>
        </form>
      </div>
    );
  }

  if (step === 'biometric-verifying') {
    return (
      <Card className="p-8 text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
        <h3 className="text-xl font-semibold">Preparing Verification</h3>
        <p className="text-muted-foreground">
          Please wait...
        </p>
      </Card>
    );
  }

  if (step === 'biometric-capturing' && challenge && attendantId && attendantInfo) {
    // Determine method from stored profile (default to face)
    const method: 'face' | 'hand' = attendantInfo.authenticationMethods?.includes('biometric_face')
      ? 'face'
      : 'hand';

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Verify Your Identity</h3>
          <p className="text-sm text-muted-foreground">
            Follow the on-screen instructions to verify your identity
          </p>
        </div>

        <BiometricCapture
          method={method}
          challenge={challenge}
          onComplete={handleCaptureComplete}
          onCancel={() => {
            setStep('auth-method');
            setChallenge(null);
          }}
          mode="verification"
        />
      </div>
    );
  }

  return null;
}
