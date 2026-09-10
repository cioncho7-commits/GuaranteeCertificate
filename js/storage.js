// 보증서 데이터 저장/조회 (Firebase Firestore 기반)
window.GC = window.GC || {};

(function () {
  const COLLECTION = "certificates";

  function db() {
    if (!window.GC.db) {
      throw new Error("Firebase가 초기화되지 않았습니다. js/firebase-config.js 설정을 확인하세요.");
    }
    return window.GC.db;
  }

  async function save(cert) {
    await db().collection(COLLECTION).doc(cert.id).set(cert);
  }

  async function findById(query) {
    const q = String(query || "").trim();
    if (!q) return null;

    const byId = await db().collection(COLLECTION).doc(q.toUpperCase()).get();
    if (byId.exists) return byId.data();

    const bySerial = await db()
      .collection(COLLECTION)
      .where("serialLower", "==", q.toLowerCase())
      .limit(1)
      .get();
    if (!bySerial.empty) return bySerial.docs[0].data();

    return null;
  }

  function generateId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `GC-${y}${m}${d}-${rand}`;
  }

  function addMonths(dateStr, months) {
    const d = new Date(dateStr);
    d.setMonth(d.getMonth() + Number(months || 0));
    return d;
  }

  function toDateInput(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function toDisplayDate(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  }

  function isExpired(expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
    return d.getTime() < today.getTime();
  }

  window.GC.storage = {
    save,
    findById,
    generateId,
    addMonths,
    toDateInput,
    toDisplayDate,
    isExpired,
  };
})();
