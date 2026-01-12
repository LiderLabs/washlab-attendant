import { useState, useCallback, useRef } from 'react';

/**
 * Order ID Hook
 * 
 * Generates order ID once and maintains it throughout the order flow
 * - Order number generated at start
 * - Does NOT change when weight/count updates
 * - Reset only when starting a new order
 */
export const useOrderId = () => {
  const [orderId, setOrderId] = useState<string | null>(null);
  const generatedRef = useRef(false);

  const generateOrderId = useCallback((): string => {
    // Only generate once
    if (orderId && generatedRef.current) {
      return orderId;
    }

    const newId = `ORD-${Math.floor(Math.random() * 9000) + 1000}`;
    setOrderId(newId);
    generatedRef.current = true;
    return newId;
  }, [orderId]);

  const resetOrderId = useCallback(() => {
    setOrderId(null);
    generatedRef.current = false;
  }, []);

  const getCurrentOrderId = useCallback((): string => {
    if (orderId) return orderId;
    return generateOrderId();
  }, [orderId, generateOrderId]);

  return {
    orderId,
    generateOrderId,
    resetOrderId,
    getCurrentOrderId
  };
};

export default useOrderId;
