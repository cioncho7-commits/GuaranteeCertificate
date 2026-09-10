import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type { Database } from "./types";

// 데모/초기 단계용 파일 기반 저장소.
// 운영 전환 시 이 모듈만 실제 DB(Prisma 등) 연동으로 교체하면 됩니다.
//
// Vercel 같은 서버리스 환경은 배포된 코드 영역이 읽기 전용이라 process.cwd()
// 아래에는 쓸 수 없고 /tmp 만 쓰기가 가능합니다. 다만 /tmp는 함수 인스턴스가
// 재활용되는 동안만 유지되고 콜드 스타트/재배포 시 초기화되므로, 이건 어디까지나
// 로그인 등 즉시 동작 확인용 임시 조치입니다. 실제 서비스에는 별도 DB가 필요합니다.
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "guarantee-certificate-data")
  : path.join(process.cwd(), "data");
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
