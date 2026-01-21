"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useBankAccounts, useCreateBankAccount, useDeleteBankAccount } from "@/lib/hooks/useBankAccounts";
import {
  useCreatePrivateFutureExpense,
  useCreatePrivateOneTimeExpense,
  useCreatePrivateRecurringExpense,
  useCreateRecurringBusinessPayment,
  usePrivateFutureExpenses,
  usePrivateOneTimeExpenses,
  usePrivateRecurringExpenses,
  useRecurringBusinessPayments
} from "@/lib/hooks/usePrivateExpenses";
import {
  useCreatePayment,
  useSetObligationStatus,
  useTaxObligations
} from "@/lib/hooks/useTaxObligations";
import { useIncomes } from "@/lib/hooks/useIncomes";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { useSettings } from "@/lib/hooks/useSettings";
import { calculateTaxes, updateObligationStatus } from "@/lib/domain/tax-engine";
import { calculateBalance } from "@/lib/domain/balance-engine";
import { formatCurrency, getCurrentMonth } from "@/lib/utils/date";

const bankSchema = z.object({
  name: z.string().min(2),
  balance: z.number()
});

const paymentSchema = z.object({
  obligation_id: z.number().positive(),
  amount: z.number().positive(),
  payment_date: z.string().min(1),
  confirmation_ref: z.string().optional()
});

const privateExpenseSchema = z.object({
  date: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(2)
});

const privateRecurringSchema = z.object({
  description: z.string().min(2),
  amount: z.number().positive(),
  interval: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"])
});

const recurringBusinessSchema = z.object({
  name: z.string().min(2),
  amount: z.number().positive()
});

export default function BalancePage() {
  const [month] = useState(getCurrentMonth());
  const { data: accounts = [] } = useBankAccounts();
  const { data: privateOneTime = [] } = usePrivateOneTimeExpenses(month);
  const { data: privateFuture = [] } = usePrivateFutureExpenses(month);
  const { data: privateRecurring = [] } = usePrivateRecurringExpenses();
  const { data: recurringBusiness = [] } = useRecurringBusinessPayments();
  const { data: obligations = [] } = useTaxObligations(month);
  const { data: incomes = [] } = useIncomes(month);
  const { data: expenses = [] } = useExpenses(month);
  const { data: settings } = useSettings();

  const createBank = useCreateBankAccount();
  const deleteBank = useDeleteBankAccount();
  const createPayment = useCreatePayment();
  const setStatus = useSetObligationStatus();
  const createOneTime = useCreatePrivateOneTimeExpense();
  const createFuture = useCreatePrivateFutureExpense();
  const createRecurring = useCreatePrivateRecurringExpense();
  const createRecurringBusiness = useCreateRecurringBusinessPayment();

  const projection = useMemo(() => {
    if (!settings) return null;
    return calculateTaxes({
      settings,
      month,
      incomes,
      expenses,
      yearToDateIncome: incomes,
      yearToDateExpenses: expenses
    });
  }, [settings, month, incomes, expenses]);

  const balance = useMemo(() => {
    return calculateBalance({
      bankAccounts: accounts,
      obligations,
      profitFirst: projection?.profitFirst ?? 0,
      privateOneTime,
      privateFuture,
      privateRecurring,
      recurringBusiness
    });
  }, [accounts, obligations, projection, privateOneTime, privateFuture, privateRecurring, recurringBusiness]);

  const [bankForm, setBankForm] = useState({ name: "", balance: 0 });
  const [paymentForm, setPaymentForm] = useState({
    obligation_id: 0,
    amount: 0,
    payment_date: `${month}-20`,
    confirmation_ref: ""
  });
  const [privateOneForm, setPrivateOneForm] = useState({
    date: `${month}-05`,
    amount: 0,
    description: ""
  });
  const [privateFutureForm, setPrivateFutureForm] = useState({
    date: `${month}-15`,
    amount: 0,
    description: ""
  });
  const [privateRecurringForm, setPrivateRecurringForm] = useState({
    description: "",
    amount: 0,
    interval: "MONTHLY"
  });
  const [recurringBusinessForm, setRecurringBusinessForm] = useState({
    name: "",
    amount: 0
  });

  const handleAddBank = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = bankSchema.safeParse({
      ...bankForm,
      balance: Number(bankForm.balance)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij dane konta.");
      return;
    }
    await createBank.mutateAsync({ name: bankForm.name, balance: Number(bankForm.balance) });
    toast.success("Dodano konto.");
    setBankForm({ name: "", balance: 0 });
  };

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = paymentSchema.safeParse({
      ...paymentForm,
      obligation_id: Number(paymentForm.obligation_id),
      amount: Number(paymentForm.amount)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij dane płatności.");
      return;
    }
    await createPayment.mutateAsync({
      obligation_id: Number(paymentForm.obligation_id),
      amount: Number(paymentForm.amount),
      payment_date: paymentForm.payment_date,
      confirmation_ref: paymentForm.confirmation_ref
    });
    const obligation = obligations.find((item) => item.id === Number(paymentForm.obligation_id));
    if (obligation) {
      const status = updateObligationStatus({ ...obligation, paid_amount: obligation.paid_amount + Number(paymentForm.amount) });
      await setStatus.mutateAsync({ id: obligation.id, status });
    }
    toast.success("Dodano płatność.");
    setPaymentForm({ ...paymentForm, amount: 0, confirmation_ref: "" });
  };

  const handlePrivateOne = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = privateExpenseSchema.safeParse({
      ...privateOneForm,
      amount: Number(privateOneForm.amount)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij dane wydatku.");
      return;
    }
    await createOneTime.mutateAsync({
      date: privateOneForm.date,
      amount: Number(privateOneForm.amount),
      description: privateOneForm.description
    });
    toast.success("Dodano wydatek jednorazowy.");
    setPrivateOneForm({ ...privateOneForm, amount: 0, description: "" });
  };

  const handlePrivateFuture = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = privateExpenseSchema.safeParse({
      ...privateFutureForm,
      amount: Number(privateFutureForm.amount)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij dane wydatku przyszłego.");
      return;
    }
    await createFuture.mutateAsync({
      date: privateFutureForm.date,
      amount: Number(privateFutureForm.amount),
      description: privateFutureForm.description
    });
    toast.success("Dodano wydatek przyszły.");
    setPrivateFutureForm({ ...privateFutureForm, amount: 0, description: "" });
  };

  const handlePrivateRecurring = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = privateRecurringSchema.safeParse({
      ...privateRecurringForm,
      amount: Number(privateRecurringForm.amount)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij dane wydatku cyklicznego.");
      return;
    }
    await createRecurring.mutateAsync({
      description: privateRecurringForm.description,
      amount: Number(privateRecurringForm.amount),
      interval: privateRecurringForm.interval,
      active: 1
    });
    toast.success("Dodano wydatek cykliczny.");
    setPrivateRecurringForm({ ...privateRecurringForm, amount: 0, description: "" });
  };

  const handleRecurringBusiness = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = recurringBusinessSchema.safeParse({
      ...recurringBusinessForm,
      amount: Number(recurringBusinessForm.amount)
    });
    if (!parsed.success) {
      toast.error("Uzupełnij dane kosztu stałego.");
      return;
    }
    await createRecurringBusiness.mutateAsync({
      name: recurringBusinessForm.name,
      amount: Number(recurringBusinessForm.amount),
      active: 1
    });
    toast.success("Dodano koszt stały.");
    setRecurringBusinessForm({ name: "", amount: 0 });
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Tyle masz</p>
          <p className="text-lg font-semibold">{formatCurrency(balance.totalBalance)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Tyle nie jest Twoje</p>
          <p className="text-lg font-semibold">{formatCurrency(balance.reservedBalance)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase text-slate-400">Możesz wydać</p>
          <p className="text-lg font-semibold">{formatCurrency(balance.availableBalance)}</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Konta bankowe</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleAddBank}>
          <label className="flex flex-col gap-2">
            Nazwa
            <input value={bankForm.name} onChange={(event) => setBankForm({ ...bankForm, name: event.target.value })} />
          </label>
          <label className="flex flex-col gap-2">
            Saldo (PLN)
            <input
              type="number"
              step="0.01"
              value={bankForm.balance}
              onChange={(event) => setBankForm({ ...bankForm, balance: Number(event.target.value) })}
            />
          </label>
          <div className="flex items-end">
            <button type="submit">Dodaj konto</button>
          </div>
        </form>
        <div className="mt-4">
          <ul className="space-y-2 text-sm">
            {accounts.map((account) => (
              <li key={account.id} className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2">
                <span>{account.name}</span>
                <span className="font-semibold">{formatCurrency(account.balance)}</span>
                <button
                  type="button"
                  className="bg-rose-500 hover:bg-rose-600"
                  onClick={() => deleteBank.mutate(account.id)}
                >
                  Usuń
                </button>
              </li>
            ))}
            {accounts.length === 0 && <p className="text-slate-400">Dodaj pierwsze konto.</p>}
          </ul>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Płatności zobowiązań</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-4" onSubmit={handlePayment}>
          <label className="flex flex-col gap-2">
            Zobowiązanie
            <select
              value={paymentForm.obligation_id}
              onChange={(event) => setPaymentForm({ ...paymentForm, obligation_id: Number(event.target.value) })}
            >
              <option value={0}>Wybierz</option>
              {obligations.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.type} {item.month}/{item.year} ({formatCurrency(item.projected_amount)})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            Kwota
            <input
              type="number"
              step="0.01"
              value={paymentForm.amount}
              onChange={(event) => setPaymentForm({ ...paymentForm, amount: Number(event.target.value) })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Data płatności
            <input
              type="date"
              value={paymentForm.payment_date}
              onChange={(event) => setPaymentForm({ ...paymentForm, payment_date: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Referencja
            <input
              value={paymentForm.confirmation_ref}
              onChange={(event) => setPaymentForm({ ...paymentForm, confirmation_ref: event.target.value })}
            />
          </label>
          <div className="flex items-end">
            <button type="submit">Dodaj płatność</button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Wydatki prywatne</h2>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <form className="flex flex-col gap-3" onSubmit={handlePrivateOne}>
            <p className="text-sm font-semibold">Jednorazowe</p>
            <input type="date" value={privateOneForm.date} onChange={(event) => setPrivateOneForm({ ...privateOneForm, date: event.target.value })} />
            <input
              type="number"
              step="0.01"
              value={privateOneForm.amount}
              onChange={(event) => setPrivateOneForm({ ...privateOneForm, amount: Number(event.target.value) })}
              placeholder="Kwota"
            />
            <input
              value={privateOneForm.description}
              onChange={(event) => setPrivateOneForm({ ...privateOneForm, description: event.target.value })}
              placeholder="Opis"
            />
            <button type="submit">Dodaj</button>
          </form>
          <form className="flex flex-col gap-3" onSubmit={handlePrivateFuture}>
            <p className="text-sm font-semibold">Przyszłe</p>
            <input type="date" value={privateFutureForm.date} onChange={(event) => setPrivateFutureForm({ ...privateFutureForm, date: event.target.value })} />
            <input
              type="number"
              step="0.01"
              value={privateFutureForm.amount}
              onChange={(event) => setPrivateFutureForm({ ...privateFutureForm, amount: Number(event.target.value) })}
              placeholder="Kwota"
            />
            <input
              value={privateFutureForm.description}
              onChange={(event) => setPrivateFutureForm({ ...privateFutureForm, description: event.target.value })}
              placeholder="Opis"
            />
            <button type="submit">Dodaj</button>
          </form>
          <form className="flex flex-col gap-3" onSubmit={handlePrivateRecurring}>
            <p className="text-sm font-semibold">Cykliczne</p>
            <input
              type="number"
              step="0.01"
              value={privateRecurringForm.amount}
              onChange={(event) => setPrivateRecurringForm({ ...privateRecurringForm, amount: Number(event.target.value) })}
              placeholder="Kwota"
            />
            <input
              value={privateRecurringForm.description}
              onChange={(event) => setPrivateRecurringForm({ ...privateRecurringForm, description: event.target.value })}
              placeholder="Opis"
            />
            <select
              value={privateRecurringForm.interval}
              onChange={(event) => setPrivateRecurringForm({ ...privateRecurringForm, interval: event.target.value })}
            >
              <option value="WEEKLY">Co tydzień</option>
              <option value="BIWEEKLY">Co 2 tygodnie</option>
              <option value="MONTHLY">Co miesiąc</option>
              <option value="QUARTERLY">Co kwartał</option>
              <option value="YEARLY">Co rok</option>
            </select>
            <button type="submit">Dodaj</button>
          </form>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm">
          <div>
            <p className="font-semibold">Jednorazowe</p>
            <ul className="mt-2 space-y-2">
              {privateOneTime.map((item) => (
                <li key={item.id} className="rounded-md border border-slate-100 px-3 py-2">
                  {item.description} - {formatCurrency(item.amount)}
                </li>
              ))}
              {privateOneTime.length === 0 && <p className="text-slate-400">Brak wpisów.</p>}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Przyszłe</p>
            <ul className="mt-2 space-y-2">
              {privateFuture.map((item) => (
                <li key={item.id} className="rounded-md border border-slate-100 px-3 py-2">
                  {item.description} - {formatCurrency(item.amount)}
                </li>
              ))}
              {privateFuture.length === 0 && <p className="text-slate-400">Brak wpisów.</p>}
            </ul>
          </div>
          <div>
            <p className="font-semibold">Cykliczne</p>
            <ul className="mt-2 space-y-2">
              {privateRecurring.map((item) => (
                <li key={item.id} className="rounded-md border border-slate-100 px-3 py-2">
                  {item.description} - {formatCurrency(item.amount)}
                </li>
              ))}
              {privateRecurring.length === 0 && <p className="text-slate-400">Brak wpisów.</p>}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Koszty stałe firmy</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-3" onSubmit={handleRecurringBusiness}>
          <label className="flex flex-col gap-2">
            Nazwa
            <input
              value={recurringBusinessForm.name}
              onChange={(event) => setRecurringBusinessForm({ ...recurringBusinessForm, name: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2">
            Kwota
            <input
              type="number"
              step="0.01"
              value={recurringBusinessForm.amount}
              onChange={(event) => setRecurringBusinessForm({ ...recurringBusinessForm, amount: Number(event.target.value) })}
            />
          </label>
          <div className="flex items-end">
            <button type="submit">Dodaj koszt stały</button>
          </div>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {recurringBusiness.map((item) => (
            <li key={item.id} className="rounded-md border border-slate-100 px-3 py-2">
              {item.name} - {formatCurrency(item.amount)}
            </li>
          ))}
          {recurringBusiness.length === 0 && <p className="text-slate-400">Brak kosztów stałych.</p>}
        </ul>
      </section>
    </div>
  );
}
