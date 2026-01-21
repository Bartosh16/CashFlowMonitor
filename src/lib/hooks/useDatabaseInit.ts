"use client";

import { useEffect, useState } from "react";
import { initDatabase } from "@/lib/db/init";

export function useDatabaseInit() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    initDatabase()
      .then(() => {
        if (mounted) {
          setReady(true);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err as Error);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { ready, error };
}
