import type { CoverCategory, CoverRole, LocalCoverRecord } from "@/types/cover-maker";

const DB_NAME = "cover_depan_belakang_maker:v1";
const DB_VERSION = 1;
const COVER_STORE = "covers";

type SaveLocalCoverInput = {
  role: CoverRole;
  category: CoverCategory;
  file: File;
};

function assertIndexedDbAvailable() {
  if (!("indexedDB" in globalThis)) {
    throw new Error("IndexedDB tidak tersedia di browser ini.");
  }
}

function createId() {
  if ("crypto" in globalThis && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function openDatabase() {
  assertIndexedDbAvailable();

  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(COVER_STORE)) {
        const store = db.createObjectStore(COVER_STORE, { keyPath: "id" });
        store.createIndex("role", "role", { unique: false });
        store.createIndex("category", "category", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };

    request.onerror = () => reject(request.error ?? new Error("Gagal membuka IndexedDB."));
    request.onsuccess = () => resolve(request.result);
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Transaksi IndexedDB gagal."));
    transaction.onabort = () => reject(transaction.error ?? new Error("Transaksi IndexedDB dibatalkan."));
  });
}

export async function getLocalCovers() {
  const db = await openDatabase();

  try {
    return await new Promise<LocalCoverRecord[]>((resolve, reject) => {
      const transaction = db.transaction(COVER_STORE, "readonly");
      const store = transaction.objectStore(COVER_STORE);
      const request = store.getAll();

      request.onerror = () => reject(request.error ?? new Error("Gagal membaca cover lokal."));
      request.onsuccess = () => {
        const records = (request.result as LocalCoverRecord[]).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        );
        resolve(records);
      };
    });
  } finally {
    db.close();
  }
}

export async function saveLocalCover(input: SaveLocalCoverInput) {
  const db = await openDatabase();
  const record: LocalCoverRecord = {
    id: createId(),
    role: input.role,
    category: input.category,
    source: "local",
    name: input.file.name.replace(/\.pdf$/i, ""),
    fileName: input.file.name,
    size: input.file.size,
    createdAt: new Date().toISOString(),
    blob: input.file,
  };

  try {
    const transaction = db.transaction(COVER_STORE, "readwrite");
    transaction.objectStore(COVER_STORE).put(record);
    await transactionDone(transaction);
    return record;
  } finally {
    db.close();
  }
}

export async function deleteLocalCover(id: string) {
  const db = await openDatabase();

  try {
    const transaction = db.transaction(COVER_STORE, "readwrite");
    transaction.objectStore(COVER_STORE).delete(id);
    await transactionDone(transaction);
  } finally {
    db.close();
  }
}

export async function clearLocalCovers() {
  const db = await openDatabase();

  try {
    const transaction = db.transaction(COVER_STORE, "readwrite");
    transaction.objectStore(COVER_STORE).clear();
    await transactionDone(transaction);
  } finally {
    db.close();
  }
}
