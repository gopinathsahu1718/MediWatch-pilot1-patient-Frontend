import { TREND_MAP } from "./constants";
import { TrendInfo } from "./types";

type Result = {
  trendStatus: "green" | "yellow" | "red";
  dayNumber: number;
  diseaseScore: number;
  overrideTriggered: boolean;
  message: string;
};

type ResultScreenProps = {
  result: Result;
  resetAll: () => void;
};

export default function ResultScreen({ result, resetAll }: ResultScreenProps) {
  const t: TrendInfo = TREND_MAP[result.trendStatus] ?? TREND_MAP.green;
  return (
    <div
      style={{
        minHeight: "80dvh",
        width: "100%",
        background: "#f4f7fb",

        display: "grid",
        placeItems: "center",

        padding: 16,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 22,
          padding: "24px 18px",
          boxShadow: "0 10px 30px rgba(59,79,212,.06)",
        }}
      >
        {/* status */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: t.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              marginBottom: 12,
            }}
          >
            {t.icon}
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: "#1e2a5e",
            }}
          >
            Update Submitted
          </h2>

          <p
            style={{
              margin: "6px 0 0",
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 900
            }}
          >
            Day {result.dayNumber}
          </p>
          <p>
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}</p>
        </div>

        {/* trend pill */}
        <div
          style={{
            background: t.bg,
            borderRadius: 16,
            padding: "14px",
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: t.tc,
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            TREND STATUS
          </div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: t.tc,
            }}
          >
            {t.label}
          </div>
        </div>

        {/* compact stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              background: "#f8faff",
              padding: 14,
              borderRadius: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#94a3b8",
                fontWeight: 700,
              }}
            >
              BASDAI SCORE
            </div>

            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#1e2a5e",
                marginTop: 4,
              }}
            >
              {result.diseaseScore}
            </div>
          </div>

          <div
            style={{
              background: "#f8faff",
              padding: 14,
              borderRadius: 14,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#94a3b8",
                fontWeight: 700,
              }}
            >
              OVERRIDE
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginTop: 8,
                color: result.overrideTriggered ? "#dc2626" : "#16a34a",
              }}
            >
              {result.overrideTriggered ? "Triggered" : "None"}
            </div>
          </div>
        </div>

        {/* message */}
        <div
          style={{
            background: "#f4f7ff",
            borderRadius: 14,
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.5,
              color: "#5162b3",
            }}
          >
            {result.message}
          </p>
        </div>

        <div
          style={{
            background: "#f0fdf4",

            padding: 14,

            borderRadius: 14,

            textAlign: "center",

            fontWeight: 700,

            color: "#16a34a",
          }}
        >
          Today&apos;s monitoring completed
        </div>

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "center",
            gap: 6,
            fontSize: 11,
            color: "#94a3b8",
          }}
        >
          <span>🔒</span>
          <span>Secure & used only for care</span>
        </div>
      </div>
    </div>
  );
}
