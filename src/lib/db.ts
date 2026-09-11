import { Redis } from "@upstash/redis";
import { promises as fs } from "fs";
import path from "path";
import type { Database } from "./types";

// 운영 저장소: Vercel에 Redis(KV) 스토리지를 연결하면 그쪽에 저장합니다.
// 로컬 개발 환경처럼 Redis가 없을 때는 프로젝트 폴더의 data/db.json 파일로 대체합니다.
// (Vercel 서버리스 환경에서 파일 저장을 쓰면 인스턴스마다 상태가 따로 놀아서
// 안 됩니다 — 반드시 Redis 등 외부 저장소가 필요합니다.)

const EMPTY_DB: Database = {
  consents: [],
  taxInvoiceProfiles: [],
  contractProfiles: [],
  managerContacts: [],
  submissions: [],
  reports: [],
};

const REDIS_KEY = "guarantee-certificate:db";

function createRedisClient(): Redis | null {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedisClient();

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

async function readFileDb(): Promise<Database> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    return { ...EMPTY_DB, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_DB };
  }
}

async function writeFileDb(db: Database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export async function readDb(): Promise<Database> {
  if (redis) {
    const data = await redis.get<Database>(REDIS_KEY);
    return data ? { ...EMPTY_DB, ...data } : { ...EMPTY_DB };
  }
  return readFileDb();
}

async function writeDb(db: Database) {
  if (redis) {
    await redis.set(REDIS_KEY, db);
    return;
  }
  await writeFileDb(db);
}

// 동시 쓰기 충돌을 막기 위해 직렬화된 큐를 통해서만 갱신합니다.
// (같은 서버리스 인스턴스 내에서의 동시 요청만 직렬화되며, 이 앱의 사용량
// 규모에서는 충분합니다.)
let writeQueue: Promise<unknown> = Promise.resolve();

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
