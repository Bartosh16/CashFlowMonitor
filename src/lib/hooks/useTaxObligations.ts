"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPayment,
  listPayments,
  listTaxObligations,
  setObligationStatus,
  upsertTaxObligation
} from "@/lib/db/repositories/tax-obligations";
import type { Payment, TaxObligation } from "@/lib/types";

export function useTaxObligations(month: string) {
  return useQuery({
    queryKey: ["tax-obligations", month],
    queryFn: () => listTaxObligations(month)
  });
}

export function useUpsertTaxObligation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<TaxObligation, "id" | "created_at" | "updated_at">) =>
      upsertTaxObligation(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["tax-obligations"] })
  });
}

export function usePayments(obligationId?: number) {
  return useQuery({
    queryKey: ["payments", obligationId],
    queryFn: () => (obligationId ? listPayments(obligationId) : []),
    enabled: Boolean(obligationId)
  });
}

export function useCreatePayment() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Payment, "id" | "created_at" | "updated_at">) =>
      createPayment(payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["payments"] });
      client.invalidateQueries({ queryKey: ["tax-obligations"] });
    }
  });
}

export function useSetObligationStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaxObligation["status"] }) =>
      setObligationStatus(id, status),
    onSuccess: () => client.invalidateQueries({ queryKey: ["tax-obligations"] })
  });
}
