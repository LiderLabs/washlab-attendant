import { useQuery, useMutation } from "convex/react";
import { api } from "@devlider001/washlab-backend/api";
import { Id } from "@devlider001/washlab-backend/dataModel";
import { useStationSession } from "./useStationSession";
import { toast } from "sonner";

export type InventoryCategory =
  | "cleaning_supplies"
  | "add_ons"
  | "facility"
  | "retail"
  | "operational";

export type InventoryStatus = "critical" | "low" | "ok" | "ordered";

export interface InventoryItem {
  _id: Id<"inventoryItems">;
  name: string;
  category: InventoryCategory;
  unit: string;
  description?: string;
  currentStock: number;
  maxStock: number;
  minStock: number;
  reorderPoint: number;
  status: InventoryStatus;
  orderedAt?: number;
  expectedArrivalDate?: number;
  arrivalDate?: number;
  orderQuantity?: number;
  branchId: Id<"branches">;
  createdAt: number;
  updatedAt: number;
  lastRestockedAt?: number;
}

/**
 * Hook to get inventory items for the current station
 */
export function useStationInventory(
  stationToken: string | null,
  filters?: {
    category?: InventoryCategory;
    status?: InventoryStatus;
  }
) {
  const inventory = useQuery(
    api.inventory.getStationInventory,
    stationToken ? { stationToken } : "skip"
  ) as InventoryItem[] | undefined;

  const isLoading = inventory === undefined;

  // Apply client-side filters if needed
  const filteredInventory = inventory?.filter((item) => {
    if (filters?.category && item.category !== filters.category) {
      return false;
    }
    if (filters?.status && item.status !== filters.status) {
      return false;
    }
    return true;
  });

  // Calculate stats
  const stats = inventory
    ? {
        critical: inventory.filter((i) => i.status === "critical").length,
        low: inventory.filter((i) => i.status === "low").length,
        ordered: inventory.filter((i) => i.status === "ordered").length,
        total: inventory.length,
      }
    : { critical: 0, low: 0, ordered: 0, total: 0 };

  return {
    inventory: filteredInventory || [],
    allInventory: inventory || [],
    isLoading,
    stats,
  };
}

/**
 * Hook to update inventory stock
 */
export function useUpdateInventoryStock() {
  const { stationToken } = useStationSession();
  const updateStock = useMutation(api.inventory.updateStock);

  return {
    updateStock: async (itemId: Id<"inventoryItems">, currentStock: number) => {
      if (!stationToken) {
        toast.error("Session expired. Please refresh.");
        return { success: false };
      }

      try {
        await updateStock({
          itemId,
          currentStock,
          stationToken,
        });
        toast.success("Stock updated successfully");
        return { success: true };
      } catch (error: any) {
        toast.error(error.message || "Failed to update stock");
        return { success: false };
      }
    },
  };
}

/**
 * Hook to place inventory order
 */
export function usePlaceInventoryOrder() {
  const { stationToken } = useStationSession();
  const placeOrder = useMutation(api.inventory.placeOrder);

  return {
    placeOrder: async (
      itemId: Id<"inventoryItems">,
      orderQuantity: number,
      expectedArrivalDate?: number
    ) => {
      if (!stationToken) {
        toast.error("Session expired. Please refresh.");
        return { success: false };
      }

      try {
        await placeOrder({
          itemId,
          orderQuantity,
          expectedArrivalDate,
          stationToken,
        });
        toast.success("Order placed successfully");
        return { success: true };
      } catch (error: any) {
        toast.error(error.message || "Failed to place order");
        return { success: false };
      }
    },
  };
}

/**
 * Hook to receive inventory order
 */
export function useReceiveInventoryOrder() {
  const { stationToken } = useStationSession();
  const receiveOrder = useMutation(api.inventory.receiveOrder);

  return {
    receiveOrder: async (
      itemId: Id<"inventoryItems">,
      receivedQuantity?: number
    ) => {
      if (!stationToken) {
        toast.error("Session expired. Please refresh.");
        return { success: false };
      }

      try {
        await receiveOrder({
          itemId,
          receivedQuantity,
          stationToken,
        });
        toast.success("Order received and stock updated");
        return { success: true };
      } catch (error: any) {
        toast.error(error.message || "Failed to receive order");
        return { success: false };
      }
    },
  };
}

/**
 * Hook to create inventory item
 */
export function useCreateInventoryItem() {
  const { stationToken } = useStationSession();
  const createItem = useMutation(api.inventory.create);

  return {
    createItem: async (
      name: string,
      category: InventoryCategory,
      unit: string,
      currentStock: number,
      maxStock: number,
      minStock: number,
      reorderPoint: number,
      description?: string,
      verificationId?: Id<"biometricVerifications">
    ) => {
      if (!stationToken) {
        toast.error("Session expired. Please refresh.");
        return { success: false };
      }

      try {
        await createItem({
          name,
          category,
          unit,
          description,
          currentStock,
          maxStock,
          minStock,
          reorderPoint,
          stationToken,
          verificationId,
        });
        toast.success("Inventory item created successfully");
        return { success: true };
      } catch (error: any) {
        toast.error(error.message || "Failed to create inventory item");
        return { success: false };
      }
    },
  };
}
