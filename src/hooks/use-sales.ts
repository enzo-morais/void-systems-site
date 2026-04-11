"use client";

import { useState, useCallback, useEffect } from "react";
import type { Sale } from "@/app/dashboard/sales/page";

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sales");
      if (res.ok) {
        setSales(await res.json());
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sales, loading, refresh };
}
