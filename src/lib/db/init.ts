import { seedDatabase } from "@/lib/db/seed";

let initialized = false;

export async function initDatabase() {
  if (initialized) {
    return;
  }
  await seedDatabase();
  initialized = true;
}
