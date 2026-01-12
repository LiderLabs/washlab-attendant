'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { BiometricVerificationModal } from './BiometricVerificationModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useIdentityVerification } from '@/hooks/useIdentityVerification';
import { useStationSession } from '@/hooks/useStationSession';

interface ActionVerificationProps {
  onVerified: (attendantId: Id<'attendants'>, verificationId: Id<'biometricVerifications'>) => void;
  onCancel: () => void;
  actionType: string;
  orderId?: Id<'orders'>;
  open: boolean;
}

/**
 * Component for verifying identity before performing critical actions
 * Shows attendant selector and biometric verification
 */
export function ActionVerification({
  onVerified,
  onCancel,
  actionType,
  orderId,
  open,
}: ActionVerificationProps) {
  const { stationToken } = useStationSession();
  const { startActionVerification, completeVerification, isLoading, challenge } = useIdentityVerification();
  
  // Get active attendances to select from
  const attendances = useQuery(
    api.stations.getActiveStationAttendances,
    stationToken ? { stationToken } : 'skip'
  ) as Array<{
    _id: Id<'attendanceLogs'>;
    clockInAt: number;
    attendant: {
      _id: Id<'attendants'>;
      name: string;
      email: string;
    } | null;
  }> | undefined;

  const [selectedAttendantId, setSelectedAttendantId] = useState<Id<'attendants'> | ''>('');
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  const handleStartVerification = async () => {
    if (!selectedAttendantId) return;

    const result = await startActionVerification(
      selectedAttendantId,
      actionType,
      orderId
    );

    if (result) {
      setShowBiometricModal(true);
    }
  };

  const handleBiometricComplete = async (biometricData: any) => {
    if (!selectedAttendantId) return;

    const result = await completeVerification(
      selectedAttendantId,
      biometricData,
      actionType,
      orderId
    );

    if (result && result.success) {
      onVerified(selectedAttendantId, result.verificationId);
      setShowBiometricModal(false);
      setSelectedAttendantId('');
    }
  };

  if (!open) return null;

  // Get unique attendants from active attendances
  const availableAttendants = attendances
    ?.filter((a) => a.attendant !== null)
    .map((a) => a.attendant!)
    .filter((attendant, index, self) =>
      index === self.findIndex((a) => a._id === attendant._id)
    ) || [];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 max-w-md w-full space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Verify Identity</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please select attendant and verify identity to continue
            </p>
          </div>

          {availableAttendants.length > 0 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Attendant</Label>
                <Select
                  value={selectedAttendantId}
                  onValueChange={(v) => setSelectedAttendantId(v as Id<'attendants'>)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select attendant" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAttendants.map((attendant) => (
                      <SelectItem key={attendant._id} value={attendant._id}>
                        {attendant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleStartVerification}
                  disabled={!selectedAttendantId || isLoading}
                  className="flex-1"
                >
                  Continue
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active attendants found. Please clock in first.</p>
              <Button variant="outline" onClick={onCancel} className="mt-4">
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <BiometricVerificationModal
        open={showBiometricModal}
        onClose={() => {
          setShowBiometricModal(false);
        }}
        onComplete={handleBiometricComplete}
        title="Verify Identity"
        description={`Verify your identity to ${actionType}`}
        isLoading={isLoading}
      />
    </>
  );
}
