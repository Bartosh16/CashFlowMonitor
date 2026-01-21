"use client";

import { ReactNode } from "react";
import { useDatabaseInit } from "@/lib/hooks/useDatabaseInit";

export default function DatabaseGate({ children }: { children: ReactNode }) {
  const { ready, error } = useDatabaseInit();

  if (error) {
    return (
      <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Nie udało się uruchomić bazy danych: {error.message}
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-4 text-sm">
        Przygotowuję lokalną bazę danych...
      </div>
    );
  }

  return <>{children}</>;
}
