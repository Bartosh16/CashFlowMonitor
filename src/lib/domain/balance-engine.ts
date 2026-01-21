import type {
  BankAccount,
  PrivateExpense,
  PrivateRecurringExpense,
  RecurringBusinessPayment,
  TaxObligation
} from "@/lib/types";

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export interface BalanceInput {
  bankAccounts: BankAccount[];
  obligations: TaxObligation[];
  profitFirst: number;
  privateOneTime: PrivateExpense[];
  privateFuture: PrivateExpense[];
  privateRecurring: PrivateRecurringExpense[];
  recurringBusiness: RecurringBusinessPayment[];
}

export interface BalanceResult {
  totalBalance: number;
  reservedBalance: number;
  availableBalance: number;
}

export function calculateBalance(input: BalanceInput): BalanceResult {
  const totalBalance = input.bankAccounts.reduce((sum, account) => sum + account.balance, 0);

  const obligationsReserve = input.obligations.reduce((sum, obligation) => {
    const target = obligation.actual_amount ?? obligation.projected_amount;
    return sum + Math.max(0, target - obligation.paid_amount);
  }, 0);

  const privateOneTime = input.privateOneTime.reduce((sum, item) => sum + item.amount, 0);
  const privateFuture = input.privateFuture.reduce((sum, item) => sum + item.amount, 0);
  const privateRecurring = input.privateRecurring
    .filter((item) => item.active === 1)
    .reduce((sum, item) => sum + item.amount, 0);

  const recurringBusiness = input.recurringBusiness
    .filter((item) => item.active === 1)
    .reduce((sum, item) => sum + item.amount, 0);

  const reservedBalance = obligationsReserve + input.profitFirst + privateOneTime + privateFuture + privateRecurring + recurringBusiness;
  const availableBalance = totalBalance - reservedBalance;

  return {
    totalBalance: round(totalBalance),
    reservedBalance: round(reservedBalance),
    availableBalance: round(availableBalance)
  };
}
