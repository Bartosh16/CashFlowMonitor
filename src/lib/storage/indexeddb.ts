const DB_NAME = "cashflow-monitor";
const DB_VERSION = 1;
const STORE_NAME = "kv";

interface StoredValue {
  key: string;
  value: unknown;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Nie udało się otworzyć IndexedDB."));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });

  return dbPromise;
}

async function withStore<T>(
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T>
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);

    callback(store)
      .then((value) => {
        transaction.oncomplete = () => resolve(value);
      })
      .catch((error) => {
        transaction.abort();
        reject(error);
      });

    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Błąd transakcji IndexedDB."));
    };
  });
}

export async function getValue<T>(key: string): Promise<T | undefined> {
  return withStore("readonly", (store) => {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        const result = request.result as StoredValue | undefined;
        resolve(result?.value as T | undefined);
      };
      request.onerror = () => {
        reject(request.error ?? new Error("Błąd odczytu danych."));
      };
    });
  });
}

export async function setValue<T>(key: string, value: T): Promise<void> {
  return withStore("readwrite", (store) => {
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value } satisfies StoredValue);
      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(request.error ?? new Error("Błąd zapisu danych."));
      };
    });
  });
}

export async function clearStore(): Promise<void> {
  return withStore("readwrite", (store) => {
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => {
        reject(request.error ?? new Error("Nie udało się wyczyścić danych."));
      };
    });
  });
}
