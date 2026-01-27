"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings, useUpdateSettings } from "@/lib/hooks/useSettings";
import { useEntitlements, useUpdatePlan } from "@/lib/hooks/useEntitlements";
import type { Plan } from "@/lib/types";
import { exportData, importData } from "@/lib/storage";

const settingsSchema = z.object({
  tax_system: z.enum(["SCALE", "LINEAR", "LUMP_SUM"]),
  is_vat_payer: z.number().int().min(0).max(1),
  tax_threshold: z.number().positive(),
  tax_rate_1: z.number().positive(),
  tax_rate_2: z.number().positive(),
  health_rate: z.number().positive(),
  tax_free_deduction: z.number().min(0),
  zus_fixed: z.number().positive(),
  profit_first_rate: z.number().positive()
});

export default function SettingsPage() {
  const { data: settings } = useSettings();
  const { data: entitlements } = useEntitlements();
  const updateSettings = useUpdateSettings();
  const updatePlan = useUpdatePlan();
  const [importing, setImporting] = useState(false);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    tax_system: "SCALE",
    is_vat_payer: 1,
    tax_threshold: 120000,
    tax_rate_1: 12,
    tax_rate_2: 32,
    health_rate: 9,
    tax_free_deduction: 3600,
    zus_fixed: 1927,
    profit_first_rate: 9
  });

  const [plan, setPlan] = useState<Plan>("FREE");

  useEffect(() => {
    if (!settings) return;
    setForm({
      tax_system: settings.tax_system,
      is_vat_payer: settings.is_vat_payer,
      tax_threshold: settings.tax_threshold,
      tax_rate_1: settings.tax_rate_1,
      tax_rate_2: settings.tax_rate_2,
      health_rate: settings.health_rate,
      tax_free_deduction: settings.tax_free_deduction,
      zus_fixed: settings.zus_fixed,
      profit_first_rate: settings.profit_first_rate
    });
  }, [settings]);

  useEffect(() => {
    if (!entitlements) return;
    setPlan(entitlements.plan);
  }, [entitlements]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = settingsSchema.safeParse({
      ...form,
      is_vat_payer: Number(form.is_vat_payer),
      tax_threshold: Number(form.tax_threshold),
      tax_rate_1: Number(form.tax_rate_1),
      tax_rate_2: Number(form.tax_rate_2),
      health_rate: Number(form.health_rate),
      tax_free_deduction: Number(form.tax_free_deduction),
      zus_fixed: Number(form.zus_fixed),
      profit_first_rate: Number(form.profit_first_rate)
    });
    if (!parsed.success) {
      toast.error("Sprawdź ustawienia podatkowe.");
      return;
    }
    await updateSettings.mutateAsync(parsed.data);
    toast.success("Zapisano ustawienia.");
  };

  const handlePlan = async () => {
    await updatePlan.mutateAsync(plan);
    toast.success("Zaktualizowano plan.");
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "cashflow-monitor-export.json";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Wyeksportowano dane.");
    } catch (error) {
      toast.error("Nie udało się wyeksportować danych.", {
        description: error instanceof Error ? error.message : "Nieznany błąd."
      });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setImporting(true);
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as Record<string, unknown>;
      await importData(payload);
      await queryClient.invalidateQueries();
      toast.success("Zaimportowano dane.");
    } catch (error) {
      toast.error("Nie udało się zaimportować danych.", {
        description: error instanceof Error ? error.message : "Nieznany błąd."
      });
    } finally {
      setImporting(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Ustawienia podatkowe</h1>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            System podatkowy
            <select
              value={form.tax_system}
              onChange={(event) => setForm({ ...form, tax_system: event.target.value as typeof form.tax_system })}
            >
              <option value="SCALE">Skala</option>
              <option value="LINEAR">Liniowy</option>
              <option value="LUMP_SUM">Ryczałt</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Płatnik VAT
            <select
              value={form.is_vat_payer}
              onChange={(event) => setForm({ ...form, is_vat_payer: Number(event.target.value) })}
            >
              <option value={1}>Tak</option>
              <option value={0}>Nie</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Próg podatkowy
            <input
              type="number"
              value={form.tax_threshold}
              onChange={(event) => setForm({ ...form, tax_threshold: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Stawka PIT 1 (%)
            <input
              type="number"
              value={form.tax_rate_1}
              onChange={(event) => setForm({ ...form, tax_rate_1: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Stawka PIT 2 (%)
            <input
              type="number"
              value={form.tax_rate_2}
              onChange={(event) => setForm({ ...form, tax_rate_2: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Stawka zdrowotna (%)
            <input
              type="number"
              value={form.health_rate}
              onChange={(event) => setForm({ ...form, health_rate: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Kwota wolna (orientacyjnie)
            <input
              type="number"
              value={form.tax_free_deduction}
              onChange={(event) => setForm({ ...form, tax_free_deduction: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            ZUS stały
            <input
              type="number"
              value={form.zus_fixed}
              onChange={(event) => setForm({ ...form, zus_fixed: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Profit First (%)
            <input
              type="number"
              value={form.profit_first_rate}
              onChange={(event) => setForm({ ...form, profit_first_rate: Number(event.target.value) })}
            />
          </label>
          <div className="flex items-end">
            <button type="submit">Zapisz ustawienia</button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Entitlements</h2>
        <p className="text-sm text-slate-500">Zmień plan aby aktywować funkcje premium (placeholder).</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <select value={plan} onChange={(event) => setPlan(event.target.value as Plan)}>
            <option value="FREE">FREE</option>
            <option value="PREMIUM">PREMIUM</option>
            <option value="BUSINESS">BUSINESS</option>
          </select>
          <button type="button" onClick={handlePlan}>
            Zapisz plan
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Eksport / Import</h2>
        <p className="text-sm text-slate-500">
          Zachowaj kopię danych lub przenieś je do innej instancji aplikacji.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleExport}>
            Eksportuj JSON
          </button>
          <label className="flex items-center gap-3 text-sm">
            <span className="rounded-md border border-slate-200 px-3 py-2 text-slate-700">
              {importing ? "Importuję..." : "Importuj JSON"}
            </span>
            <input
              className="hidden"
              type="file"
              accept="application/json"
              onChange={handleImport}
              disabled={importing}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
