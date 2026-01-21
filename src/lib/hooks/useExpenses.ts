"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  createExpenseCategory,
  deleteExpense,
  listExpenseCategories,
  listExpenses,
  listExpensesByYear
} from "@/lib/db/repositories/expenses";
import type { Expense } from "@/lib/types";

export function useExpenseCategories() {
  return useQuery({
    queryKey: ["expense-categories"],
    queryFn: listExpenseCategories
  });
}

export function useCreateExpenseCategory() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createExpenseCategory(name),
    onSuccess: () => client.invalidateQueries({ queryKey: ["expense-categories"] })
  });
}

export function useExpenses(month?: string) {
  return useQuery({
    queryKey: ["expenses", month],
    queryFn: () => listExpenses(month)
  });
}

export function useExpensesYear(year: string) {
  return useQuery({
    queryKey: ["expenses-year", year],
    queryFn: () => listExpensesByYear(year)
  });
}

export function useCreateExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Expense, "id" | "created_at" | "updated_at">) => createExpense(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["expenses"] })
  });
}

export function useDeleteExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpense(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["expenses"] })
  });
}
