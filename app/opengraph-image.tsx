import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LifeOS — AI Personal Operating System";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background:
            "linear-gradient(145deg, #07070f 0%, #10101c 45%, #17172a 100%)",
          color: "#e8ecf4",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            left: "20%",
            width: 480,
            height: 480,
            borderRadius: 999,
            background: "rgba(124, 92, 255, 0.28)",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: "10%",
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(61, 255, 181, 0.14)",
            filter: "blur(40px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #7c5cff, #5b3fd4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 36, fontWeight: 700 }}>LifeOS</span>
            <span style={{ fontSize: 18, color: "#94a0b8" }}>Control room</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 900,
            }}
          >
            Your life&apos;s control room in one conversation
          </div>
          <div style={{ fontSize: 28, color: "#94a0b8", maxWidth: 820 }}>
            Gmail · Calendar · Drive — private OAuth and approvals when it
            matters
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            fontSize: 20,
            color: "#3dffb5",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#3dffb5",
            }}
          />
          Ask once. Inbox summarized. Meeting booked.
        </div>
      </div>
    ),
    { ...size }
  );
}
