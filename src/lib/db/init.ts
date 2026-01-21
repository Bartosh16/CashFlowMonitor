import { migrate } from "@/lib/db/migrate";
import { seedDatabase } from "@/lib/db/seed";

let initialized = false;

export async function initDatabase() {
  if (initialized) {
    return;
  }
  await migrate();
  await seedDatabase();
  initialized = true;
}
