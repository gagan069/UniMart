import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing application toasts with guaranteed timer safety.
 * A new toast automatically clears any existing timer so older timers
 * never close newer toasts prematurely.
 */
export function useToast(defaultDuration = 3500) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((toastData, duration = defaultDuration) => {
    // Clear any active timer immediately so older toast timer never closes newer toast
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!toastData) {
      setToast(null);
      return;
    }

    const normalized = typeof toastData === 'string'
      ? { type: 'success', text: toastData }
      : {
          type: toastData.type === 'danger' ? 'error' : (toastData.type || 'info'),
          text: toastData.text || toastData.message || '',
          icon: toastData.icon
        };

    setToast(normalized);

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setToast(null);
        timerRef.current = null;
      }, duration);
    }
  }, [defaultDuration]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { toast, showToast, hideToast };
}

export default useToast;
