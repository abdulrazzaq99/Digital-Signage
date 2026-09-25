"use client";
import { useEffect, useState } from "react";

/** The value, updated only after it has stopped changing for `ms`. Search boxes use it so typing sends one request, not one per keystroke. */
export function useDebouncedValue<T>(value: T, ms = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}
