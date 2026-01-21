"use client";

import { useEffect, useMemo, useState } from "react";
import { useSettings } from "@/lib/hooks/useSettings";
import { useExpenses, useExpensesYear } from "@/lib/hooks/useExpenses";
import { useIncomes, useIncomesYear } from "@/lib/hooks/useIncomes";
import { useTaxObligations, useUpsertTaxObligation } from "@/lib/hooks/useTaxObligations";
import { calculateTaxes, updateObligationStatus } from "@/lib/domain/tax-engine";
import { getCurrentMonth, formatCurrency } from "@/lib/utils/date";
import { toast } from "sonner";

export default function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const { data: settings } = useSettings();
  const { data: incomes = [] } = useIncomes(month);
  const { data: expenses = [] } = useExpenses(month);
  const { data: incomesYear = [] } = useIncomesYear(month.slice(0, 4));
  const { data: expensesYear = [] } = useExpensesYear(month.slice(0, 4));
  const { data: obligations = [] } = useTaxObligations(month);
  const upsert = useUpsertTaxObligation();

  const projection = useMemo(() => {
    if (!settings) return null;
    return calculateTaxes({
      settings,
      month,
      incomes,
      expenses,
      yearToDateIncome: incomesYear,
      yearToDateExpenses: expensesYear
    });
  }, [settings, month, incomes, expenses, incomesYear, expensesYear]);

  useEffect(() => {
    if (!projection) return;
    projection.obligations.forEach((obligation) => {
      const existing = obligations.find((item) => item.type === obligation.type);
      const merged = {
        ...obligation,
        paid_amount: existing?.paid_amount ?? 0,
        actual_amount: existing?.actual_amount ?? null
      };
      upsert.mutate({
        ...merged,
        status: updateObligationStatus({
          id: existing?.id ?? 0,
          created_at: null,
          updated_at: null,
          ...merged
        })
      });
    });
  }, [projection, obligations, upsert]);

  const handleRefresh = () => {
    toast.success("Zaktualizowano zobowiązania miesiąca.");
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <p className="text-sm text-slate-500">Podsumowanie miesiąca i szacunki podatkowe.</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
            <button type="button" onClick={handleRefresh}>
              Odśwież szacunki
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {settings?.is_vat_payer === 1 && (
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase text-slate-400">VAT do zapłaty</p>
            <p className="text-lg font-semibold">{formatCurrency(projection?.vatDue ?? 0)}</p>
          </div>
        )}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">PIT (szacunek)</p>
          <p className="text-lg font-semibold">{formatCurrency(projection?.pitDue ?? 0)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">ZUS (szacunek)</p>
          <p className="text-lg font-semibold">{formatCurrency(projection?.zusDue ?? 0)}</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Zobowiązania</h2>
        <p className="text-sm text-slate-500">
          Automatycznie wyliczone szacunki. Uproszczenie: składka zdrowotna liczona z bieżącego miesiąca.
          Uzupełnij płatności w module Balans.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Typ</th>
                <th>Szacunek</th>
                <th>Status</th>
                <th>Termin</th>
              </tr>
            </thead>
            <tbody>
              {obligations.map((item) => (
                <tr key={item.id}>
                  <td>{item.type}</td>
                  <td>{formatCurrency(item.projected_amount)}</td>
                  <td className="capitalize">{item.status.replace("_", " ")}</td>
                  <td>{item.due_date}</td>
                </tr>
              ))}
              {obligations.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400">
                    Brak zobowiązań dla tego miesiąca.
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
