"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useCreateIncome, useDeleteIncome, useIncomes } from "@/lib/hooks/useIncomes";
import { formatCurrency, getCurrentMonth } from "@/lib/utils/date";

const incomeSchema = z.object({
  date: z.string().min(1),
  contractor: z.string().min(2),
  title: z.string().min(2),
  net_amount: z.number().positive(),
  invoice_ref: z.string().optional(),
  notes: z.string().optional()
});

export default function IncomesPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const { data: incomes = [] } = useIncomes(month);
  const createIncome = useCreateIncome();
  const deleteIncome = useDeleteIncome();

  const [form, setForm] = useState({
    date: `${month}-01`,
    contractor: "",
    title: "",
    net_amount: 0,
    invoice_ref: "",
    notes: ""
  });

  useEffect(() => {
    setForm((prev) => ({ ...prev, date: `${month}-01` }));
  }, [month]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = incomeSchema.safeParse({
      ...form,
      net_amount: Number(form.net_amount)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij wymagane pola.");
      return;
    }

    const net = Number(form.net_amount);
    const vat = net * 0.23;
    await createIncome.mutateAsync({
      date: form.date,
      contractor: form.contractor,
      title: form.title,
      net_amount: net,
      vat_amount: vat,
      gross_amount: net + vat,
      invoice_ref: form.invoice_ref || null,
      notes: form.notes || null
    });
    toast.success("Dodano przychód.");
    setForm({ ...form, contractor: "", title: "", net_amount: 0, invoice_ref: "", notes: "" });
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Przychody</h1>
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </div>
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
            Kontrahent
            <input
              value={form.contractor}
              onChange={(event) => setForm({ ...form, contractor: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Tytuł
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label className="flex flex-col gap-2">
            Netto (PLN)
            <input
              type="number"
              step="0.01"
              value={form.net_amount}
              onChange={(event) => setForm({ ...form, net_amount: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Ref. faktury (opcjonalnie)
            <input
              value={form.invoice_ref}
              onChange={(event) => setForm({ ...form, invoice_ref: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Notatki
            <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </label>
          <div className="flex items-end">
            <button type="submit" className="w-full md:w-auto">
              Dodaj
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Lista przychodów</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Kontrahent</th>
                <th>Tytuł</th>
                <th>Netto</th>
                <th>VAT</th>
                <th>Brutto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {incomes.map((income) => (
                <tr key={income.id}>
                  <td>{income.date}</td>
                  <td>{income.contractor}</td>
                  <td>{income.title}</td>
                  <td>{formatCurrency(income.net_amount)}</td>
                  <td>{formatCurrency(income.vat_amount)}</td>
                  <td>{formatCurrency(income.gross_amount)}</td>
                  <td>
                    <button
                      type="button"
                      className="bg-rose-500 hover:bg-rose-600"
                      onClick={() => deleteIncome.mutate(income.id)}
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
              {incomes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Brak przychodów w tym miesiącu.
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
