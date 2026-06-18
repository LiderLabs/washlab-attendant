'use client';
/**
 * useOfflineCache
 * ---------------
 * Central offline cache layer.
 * When ONLINE  -> writes live Convex data to localStorage under versioned keys.
 * When OFFLINE -> reads those keys back so pages still have data to display.
 */

const OFFLINE_CACHE_VERSION = 'v1';
const PFX = `washlab_cache_${OFFLINE_CACHE_VERSION}_`;

export const CK = {
  stats:           (branchId: string, start: number, end: number) =>
                     `washlab_cache_v1_stats_${branchId}_${start}_${end}`,
  dashboardOrders: (branchId: string) => `washlab_cache_v1_dash_orders_${branchId}`,
  branchServices:  (branchId: string) => `washlab_cache_v1_branch_services_${branchId}`,
  inventory:       (branchId: string) => `washlab_cache_v1_inventory_${branchId}`,
  customers:       (branchId: string) => `${PFX}customers_${branchId}`,
  orders:          (branchId: string) => `${PFX}orders_${branchId}`,
  transactions:    (branchId: string) => `${PFX}transactions_${branchId}`,
  attendances:     (branchId: string) => `${PFX}attendances_${branchId}`,
  attendants:      (branchId: string) => `${PFX}attendants_${branchId}`,
  reconSummary:    (branchId: string) => `${PFX}recon_summary_${branchId}`,
  reconOrders:     (branchId: string) => `${PFX}recon_orders_${branchId}`,
  reconDeductions: (branchId: string) => `${PFX}recon_deductions_${branchId}`,
};

export interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

export function cacheWrite<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = { data, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch { /* storage full - silently skip */ }
}

export function cacheRead<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CacheEntry<T>) : null;
  } catch {
    return null;
  }
}

export function cacheStaleness(savedAt: number): string {
  const mins = Math.floor((Date.now() - savedAt) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 min ago';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  return hrs === 1 ? '1 hr ago' : `${hrs} hrs ago`;
}
