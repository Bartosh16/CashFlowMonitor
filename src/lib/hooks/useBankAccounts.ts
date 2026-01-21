"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBankAccount,
  deleteBankAccount,
  listBankAccounts,
  updateBankAccountBalance
} from "@/lib/db/repositories/bank-accounts";
import type { BankAccount } from "@/lib/types";

export function useBankAccounts() {
  return useQuery({
    queryKey: ["bank-accounts"],
    queryFn: listBankAccounts
  });
}

export function useCreateBankAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<BankAccount, "id" | "created_at" | "updated_at">) =>
      createBankAccount(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["bank-accounts"] })
  });
}

export function useUpdateBankBalance() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, balance }: { id: number; balance: number }) =>
      updateBankAccountBalance(id, balance),
    onSuccess: () => client.invalidateQueries({ queryKey: ["bank-accounts"] })
  });
}

export function useDeleteBankAccount() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBankAccount(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["bank-accounts"] })
  });
}
