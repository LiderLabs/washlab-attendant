'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a session token
    const sessionToken = localStorage.getItem('attendant_session_token');
    
    if (sessionToken) {
      // User has active session, redirect to dashboard
      router.push('/washstation/dashboard');
    } else {
      // No session, redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
