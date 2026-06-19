import { SEG_COLORS, LABEL_COLORS } from "../constants";
import { getLabel } from "../helpers";
import { RangeQuestionProps } from "../types";

export default function RangeQuestion({autoScrollEnabled,  question, value, onChange }: RangeQuestionProps) {
    
  return (
    <div>
      

      {/* Emoji row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          padding: "0 4px",
          height: 26,
          alignItems: "center",
        }}
      >
        {["😊", "😐", "😟", "😡"].map((e) => (
          <span key={e} style={{ fontSize: 18, lineHeight: 1 }}>
            {e}
          </span>
        ))}
      </div>

      {/* Segment track + buttons */}
      <div style={{ position: "relative", padding: "6px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            height: 4,
            zIndex: 1,
          }}
        >
          {SEG_COLORS.map((c, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 4,
                background: c,
                opacity: value !== undefined && i < value - 1 ? 1 : 0.22,
                transition: "opacity .25s",
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const isActive = n === value;
            const ni = getLabel(n);
            return (
              <div
                key={n}
                style={{ flex: 1, display: "flex", justifyContent: "center" }}
              >
                <button
                  onClick={() => onChange(n)}
                  style={{
                    width: 28,
                    height: 28,
                    minWidth: 28,
                    borderRadius: "50%",
                    background: isActive ? ni.color : "#fff",
                    border: `2px solid ${ni.color}`,
                    color: isActive ? "#fff" : ni.color,
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background .15s, color .15s",
                  }}
                >
                  {n}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          padding: "0 2px",
        }}
      >
        {["Stable", "Moderate", "Critical"].map((l, i) => (
          <span
            key={l}
            style={{ fontSize: 10, fontWeight: 700, color: LABEL_COLORS[i] }}
          >
            {l}
          </span>
        ))}
      </div>

      {/* Selection chip */}
      <div
        style={{
          height: 44,
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value !== undefined ? (
          <div
            style={{
              background: "#f0f4ff",
              borderRadius: 24,
              padding: "9px 18px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ color: "#3b4fd4", fontWeight: 700, fontSize: 14 }}>
              ✓
            </span>
            <span style={{ fontSize: 13, color: "#3b4fd4", fontWeight: 500 }}>
              You selected:{" "}
              <strong style={{ color: getLabel(value).color }}>
                {value} / 10 ({getLabel(value).label})
              </strong>
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>

      <div
        style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}
      >
        <span style={{ color: "#7c3aed", fontSize: 12 }}>✦</span>

        {autoScrollEnabled ? <span style={{ fontSize: 11, color: "#7c3aed" }}>
          We&apos;ll save this and show you the next question automatically
        </span> : <span style={{ fontSize: 11, color: "#7c3aed" }}>
          Manually select next question or switch to auto mode.
        </span> }
        
      </div>
    </div>
  );
}

