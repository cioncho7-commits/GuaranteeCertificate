import { readDb, updateDb } from "./db";
import type { ConsentRecord } from "./types";

export async function getConsent(userId: string): Promise<ConsentRecord | null> {
  const db = await readDb();
  return db.consents.find((c) => c.userId === userId) ?? null;
}

export async function saveConsent(
  userId: string,
  requiredAgreed: boolean,
  marketingAgreed: boolean
): Promise<ConsentRecord> {
  return updateDb((db) => {
    const record: ConsentRecord = {
      userId,
      requiredAgreed,
      marketingAgreed,
      agreedAt: new Date().toISOString(),
    };
    db.consents = db.consents.filter((c) => c.userId !== userId);
    db.consents.push(record);
    return record;
  });
}
