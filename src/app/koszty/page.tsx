"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  useCreateExpense,
  useCreateExpenseCategory,
  useDeleteExpense,
  useExpenseCategories,
  useExpenses
} from "@/lib/hooks/useExpenses";
import { formatCurrency, getCurrentMonth } from "@/lib/utils/date";

const expenseSchema = z.object({
  date: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(2),
  category_id: z.number().positive()
});

export default function CostsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const { data: categories = [] } = useExpenseCategories();
  const { data: expenses = [] } = useExpenses(month);
  const createExpense = useCreateExpense();
  const createCategory = useCreateExpenseCategory();
  const deleteExpense = useDeleteExpense();

  const [form, setForm] = useState({
    date: `${month}-01`,
    amount: 0,
    description: "",
    category_id: 0
  });
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: `${month}-01` }));
  }, [month]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = expenseSchema.safeParse({
      ...form,
      amount: Number(form.amount),
      category_id: Number(form.category_id)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij wymagane pola kosztu.");
      return;
    }

    await createExpense.mutateAsync({
      date: form.date,
      amount: Number(form.amount),
      description: form.description,
      category_id: Number(form.category_id)
    });
    toast.success("Dodano koszt.");
    setForm({ ...form, amount: 0, description: "" });
  };

  const handleCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Podaj nazwę kategorii.");
      return;
    }
    await createCategory.mutateAsync(categoryName.trim());
    toast.success("Dodano kategorię.");
    setCategoryName("");
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Koszty</h1>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>
        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={handleCategory}>
          <label className="flex flex-col gap-2">
            Nowa kategoria
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
          </label>
          <button type="submit">Dodaj kategorię</button>
        </form>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            Data
            <input
              type="date"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Kwota (PLN)
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(event) => setForm({ ...form, amount: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Opis
            <input
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Kategoria
            <select
              value={form.category_id}
              onChange={(event) => setForm({ ...form, category_id: Number(event.target.value) })}
            >
              <option value={0}>Wybierz kategorię</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="submit">Dodaj koszt</button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Lista kosztów</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Opis</th>
                <th>Kategoria</th>
                <th>Kwota</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.date}</td>
                  <td>{expense.description}</td>
                  <td>{categories.find((cat) => cat.id === expense.category_id)?.name ?? "-"}</td>
                  <td>{formatCurrency(expense.amount)}</td>
                  <td>
                    <button
                      type="button"
                      className="bg-rose-500 hover:bg-rose-600"
                      onClick={() => deleteExpense.mutate(expense.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400">
                    Brak kosztów w tym miesiącu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
