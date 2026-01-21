"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPrivateFutureExpense,
  createPrivateOneTimeExpense,
  createPrivateRecurringExpense,
  createRecurringBusinessPayment,
  listPrivateFutureExpenses,
  listPrivateOneTimeExpenses,
  listPrivateRecurringExpenses,
  listRecurringBusinessPayments
} from "@/lib/db/repositories/private-expenses";
import type { PrivateExpense, PrivateRecurringExpense, RecurringBusinessPayment } from "@/lib/types";

export function usePrivateOneTimeExpenses(month?: string) {
  return useQuery({
    queryKey: ["private-one-time", month],
    queryFn: () => listPrivateOneTimeExpenses(month)
  });
}

export function usePrivateFutureExpenses(month?: string) {
  return useQuery({
    queryKey: ["private-future", month],
    queryFn: () => listPrivateFutureExpenses(month)
  });
}

export function usePrivateRecurringExpenses() {
  return useQuery({
    queryKey: ["private-recurring"],
    queryFn: listPrivateRecurringExpenses
  });
}

export function useRecurringBusinessPayments() {
  return useQuery({
    queryKey: ["recurring-business"],
    queryFn: listRecurringBusinessPayments
  });
}

export function useCreatePrivateOneTimeExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<PrivateExpense, "id" | "created_at" | "updated_at">) =>
      createPrivateOneTimeExpense(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["private-one-time"] })
  });
}

export function useCreatePrivateFutureExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<PrivateExpense, "id" | "created_at" | "updated_at">) =>
      createPrivateFutureExpense(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["private-future"] })
  });
}

export function useCreatePrivateRecurringExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<PrivateRecurringExpense, "id" | "created_at" | "updated_at">) =>
      createPrivateRecurringExpense(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["private-recurring"] })
  });
}

export function useCreateRecurringBusinessPayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<RecurringBusinessPayment, "id" | "created_at" | "updated_at">) =>
      createRecurringBusinessPayment(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["recurring-business"] })
  });
}
