'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InactiveBranchScreenProps {
  branchName?: string;
  onRefresh?: () => void;
}

export function InactiveBranchScreen({ branchName, onRefresh }: InactiveBranchScreenProps) {
  const router = useRouter();

  const handleLogout = () => {
    // Clear all station session data
    localStorage.removeItem('station_token');
    localStorage.removeItem('station_branch_id');
    localStorage.removeItem('station_device_id');
    localStorage.removeItem('station_session_id');
    localStorage.removeItem('station_branch_name');
    
    // Redirect to login
    router.push('/login');
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-red-200 shadow-2xl">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex justify-center">
            <Logo className="h-12 w-auto" />
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">
            Branch Inactive
          </CardTitle>
          <CardDescription className="text-base">
            This workstation is currently unavailable
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {branchName ? (
                <>
                  The branch <strong>{branchName}</strong> has been set to inactive by the administrator.
                </>
              ) : (
                <>
                  This branch has been set to inactive by the administrator.
                </>
              )}
              <br />
              <br />
              Please contact your administrator to reactivate this branch, or log in with a different branch code.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Check Again
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out and Return to Login
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact your administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
