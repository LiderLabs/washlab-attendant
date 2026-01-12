'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";

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
 * Hook to search customers for station
 * Provides customer search functionality
 */
export function useStationCustomers(stationToken: string | null) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search customers
  const customers = useQuery(
    api.stations.searchStationCustomers,
    stationToken && debouncedQuery.length >= 2 ? {
      stationToken,
      query: debouncedQuery,
      limit: 20,
    } : 'skip'
  ) as StationCustomer[] | undefined;

  return {
    customers: customers ?? [],
    searchQuery,
    setSearchQuery,
    isLoading: customers === undefined && debouncedQuery.length >= 2,
  };
}
