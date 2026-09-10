// 보증서 데이터 저장/조회 (localStorage 기반)
// 추후 웹앱/서버 연동 시 이 모듈의 함수 시그니처만 유지하면 교체가 쉽습니다.
window.GC = window.GC || {};

(function () {
  const STORAGE_KEY = "gc_certificates";

  function getAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function save(cert) {
    const list = getAll();
    list.push(cert);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function findById(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return null;
    return (
      getAll().find(
        (c) => c.id.toLowerCase() === q || c.serial.toLowerCase() === q
      ) || null
    );
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
    getAll,
    save,
    findById,
    generateId,
    addMonths,
    toDateInput,
    toDisplayDate,
    isExpired,
  };
})();
