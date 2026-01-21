PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  tax_system TEXT CHECK (tax_system IN ('SCALE','LINEAR','LUMP_SUM')) DEFAULT 'SCALE',
  is_vat_payer INTEGER DEFAULT 1,
  tax_threshold INTEGER DEFAULT 120000,
  tax_rate_1 REAL DEFAULT 12.00,
  tax_rate_2 REAL DEFAULT 32.00,
  health_rate REAL DEFAULT 9.00,
  tax_free_deduction REAL DEFAULT 3600.00,
  zus_fixed REAL DEFAULT 1927.00,
  profit_first_rate REAL DEFAULT 9.00,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS entitlements (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  plan TEXT CHECK (plan IN ('FREE','PREMIUM','BUSINESS')) NOT NULL DEFAULT 'FREE',
  ads_enabled INTEGER NOT NULL DEFAULT 1,
  company_mode_enabled INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS incomes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  contractor TEXT NOT NULL,
  title TEXT NOT NULL,
  net_amount REAL NOT NULL,
  vat_amount REAL NOT NULL,
  gross_amount REAL NOT NULL,
  invoice_ref TEXT NULL,
  notes TEXT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS expense_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER NOT NULL REFERENCES expense_categories(id),
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS recurring_business_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS private_one_time_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS private_future_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  description TEXT NOT NULL,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS private_recurring_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  interval TEXT CHECK (interval IN ('WEEKLY','BIWEEKLY','MONTHLY','QUARTERLY','YEARLY')) NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  balance REAL NOT NULL DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS tax_obligations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT CHECK (type IN ('PIT','ZUS','VAT')) NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  projected_amount REAL NOT NULL,
  actual_amount REAL NULL,
  paid_amount REAL NOT NULL DEFAULT 0,
  due_date TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending','partially_paid','paid','overdue')) NOT NULL,
  created_at TEXT,
  updated_at TEXT,
  UNIQUE (type, month, year)
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  obligation_id INTEGER NOT NULL REFERENCES tax_obligations(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  confirmation_ref TEXT NULL,
  created_at TEXT,
  updated_at TEXT
);
