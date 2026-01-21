import Database from "tauri-plugin-sql-api";

let dbInstance: Database | null = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:cashflow.db");
  }
  return dbInstance;
}
