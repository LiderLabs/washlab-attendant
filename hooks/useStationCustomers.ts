'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { cacheWrite, cacheRead, CK } from './useOfflineCache';
import { api } from "@jordan6699/washlab-backend/api";
import { Id } from "@jordan6699/washlab-backend/dataModel";

export interface StationCustomer {
  _id: Id<'users'>;
  name: string;
  phoneNumber: string;
  email?: string;
  status?: 'active' | 'blocked' | 'suspended' | 'restricted';
  orderCount: number;
  completedOrderCount: number;
  totalSpent: number;
}

/**
 * Normalise phone input so "055 288 7039", "0552887039",
 * and "+233552887039" all resolve to the same search string.
 */
function normaliseQuery(query: string): string {
  const digits = query.replace(/\D/g, '')
  // If it looks like a phone number (starts with 0, 233, or is 9-10 digits)
  if (digits.length >= 9) {
    if (digits.startsWith('233')) return `+233${digits.slice(3)}`
    if (digits.startsWith('0')) return `+233${digits.slice(1)}`
    return `+233${digits}`
  }
  // Not a phone number (name search) — return trimmed original
  return query.trim()
}

/**
 * Hook to search customers for station
 * Provides customer search functionality
 */
export function useStationCustomers(stationToken: string | null, branchId?: string) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Normalise before sending to backend
  const normalisedQuery = normaliseQuery(debouncedQuery);

  // Search customers
  const customers = useQuery(
    api.stations.searchStationCustomers,
    stationToken && normalisedQuery.length >= 2 ? {
      stationToken,
      query: normalisedQuery,
      limit: 20,
    } : 'skip'
  ) as StationCustomer[] | undefined;

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  useEffect(() => {
    const onOnline  = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);
  const isOffline = !isOnline;

  // Cache last successful search result
  useEffect(() => {
    if (branchId && customers && customers.length > 0) {
      cacheWrite(CK.customers(branchId), customers);
    }
  }, [customers, branchId]);

  // Always read cache as fallback
  const cachedEntry = branchId ? cacheRead<StationCustomer[]>(CK.customers(branchId)) : null;

  // Online: show live results if available, else cache; Offline: always cache
  const effectiveCustomers = isOffline
    ? (cachedEntry?.data ?? [])
    : (customers ?? cachedEntry?.data ?? []);

  return {
    customers: effectiveCustomers,
    searchQuery,
    setSearchQuery,
    isLoading: isOnline && customers === undefined && debouncedQuery.length >= 2,
    isOffline,
    cachedAt: cachedEntry?.savedAt ?? null,
  };
}