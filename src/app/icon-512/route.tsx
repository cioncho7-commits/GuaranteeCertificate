import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #10b981, #0d9488)",
          color: "white",
          fontSize: 256,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        한
      </div>
    ),
    { ...size }
  );
}
