"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createIncome, deleteIncome, listIncomes, listIncomesByYear } from "@/lib/db/repositories/incomes";
import type { Income } from "@/lib/types";

export function useIncomes(month?: string) {
  return useQuery({
    queryKey: ["incomes", month],
    queryFn: () => listIncomes(month)
  });
}

export function useIncomesYear(year: string) {
  return useQuery({
    queryKey: ["incomes-year", year],
    queryFn: () => listIncomesByYear(year)
  });
}

export function useCreateIncome() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Income, "id" | "created_at" | "updated_at">) => createIncome(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["incomes"] })
  });
}

export function useDeleteIncome() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteIncome(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["incomes"] })
  });
}
