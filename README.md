# CashFlow Monitor (MVP)

Desktopowa aplikacja offline-first dla monitorowania finansów firmy/freelancera. UI działa w oknie Tauri, dane są przechowywane lokalnie w SQLite.

> **Uwaga:** Wszelkie wyliczenia w aplikacji są szacunkowe i należy je skonsultować z księgowym.

## Wymagania

- Node.js 18+
- pnpm
- Rust + Tauri CLI (`cargo install tauri-cli`)

## Uruchomienie (dev)

```bash
pnpm install
pnpm tauri dev
```

## Build

```bash
pnpm tauri build
```

## Gdzie jest plik DB?

Aplikacja używa `tauri-plugin-sql` i tworzy plik `cashflow.db` w katalogu danych aplikacji:

- macOS: `~/Library/Application Support/CashFlow Monitor/cashflow.db`
- Windows: `%APPDATA%\CashFlow Monitor\cashflow.db`
- Linux: `~/.local/share/CashFlow Monitor/cashflow.db`

## Reset danych

1. Zamknij aplikację.
2. Usuń plik `cashflow.db` z katalogu danych aplikacji (patrz wyżej).
3. Uruchom ponownie aplikację - migracje i seedy zostaną uruchomione automatycznie.

## Struktura projektu

- `src/lib/db` - migracje, klient SQLite, repozytoria
- `src/lib/domain` - logika domenowa (TaxEngine, BalanceEngine, Entitlements)
- `src/app` - strony UI (Next.js)

## Funkcje MVP

- CRUD: Przychody, Koszty + Kategorie, Konta bankowe, Wydatki prywatne (3 typy)
- Zobowiązania PIT/ZUS/VAT - automatyczne tworzenie i aktualizacja szacunków
- Płatności zobowiązań i statusy
- Balans: „Tyle masz / Tyle nie jest Twoje / Możesz wydać”
- Entitlements: plan FREE/PREMIUM/BUSINESS + placeholder „Upgrade”
- Reklamy: placeholder w FREE (brak na ekranach krytycznych)

