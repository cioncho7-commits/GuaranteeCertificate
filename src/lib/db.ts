import { promises as fs } from "fs";
import path from "path";
import type { Database } from "./types";

// 데모/초기 단계용 파일 기반 저장소.
// 운영 전환 시 이 모듈만 실제 DB(Prisma 등) 연동으로 교체하면 됩니다.
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const EMPTY_DB: Database = {
  consents: [],
  taxInvoiceProfiles: [],
  contractProfiles: [],
  managerContacts: [],
  submissions: [],
};

let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(EMPTY_DB, null, 2), "utf-8");
  }
}

export async function readDb(): Promise<Database> {
  await ensureFile();
  const raw = await fs.readFile(DB_FILE, "utf-8");
  try {
    return { ...EMPTY_DB, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_DB };
  }
}

async function writeDb(db: Database) {
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// 동시 쓰기 충돌을 막기 위해 직렬화된 큐를 통해서만 갱신합니다.
export async function updateDb<T>(
  mutator: (db: Database) => T | Promise<T>
): Promise<T> {
  const task = writeQueue.then(async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}
