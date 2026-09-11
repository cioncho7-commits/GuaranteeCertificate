import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireUserId } from "@/lib/session";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
]);

export async function POST(req: Request) {
  const userId = await requireUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "파일 크기는 10MB 이하만 가능합니다." },
      { status: 400 }
    );
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "이미지(JPG/PNG/WEBP/HEIC) 또는 PDF 파일만 업로드할 수 있습니다." },
      { status: 400 }
    );
  }

  try {
    const safeName = file.name.replace(/[^\w.\-가-힣]/g, "_");
    const blob = await put(
      `attachments/${userId}/${Date.now()}-${safeName}`,
      file,
      { access: "public" }
    );
    return NextResponse.json({ url: blob.url, name: file.name });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "파일 업로드에 실패했습니다. 관리자가 Blob 저장소를 연결했는지 확인하세요.",
      },
      { status: 500 }
    );
  }
}
