import { useState } from "react";
import { BooleanQuestionProps } from "../types";

export default function BooleanQuestion({
  question,
  value,
  onChange,
}: BooleanQuestionProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  // TRUE = Trigger Alert
  // FALSE = No Alert
  const criticalValue = true;

  const criticalLabel = "Yes";
  const isCritical = value === criticalValue;

  const handleSelect = (val: boolean) => {
    if (val === criticalValue) {
      setShowConfirm(true);
      return;
    }

    onChange(false);
  };

  const confirmCritical = () => {
    onChange(true);
    setShowConfirm(false);
  };

  return (
    <>
      <div>
        {/* Alert info */}
        <div
          style={{
            background: "#fff1f2",
            borderRadius: 10,
            padding: "11px 14px",
            marginBottom: 16,
            borderLeft: "3px solid #dc2626",
          }}
        >
          <p
            style={{
              fontSize: 12,
              color: "#991b1b",
              fontWeight: 700,
              margin: "0 0 4px",
            }}
          >
            ⚠ Alert Trigger Question
          </p>

          <p
            style={{
              fontSize: 11,
              color: "#b91c1c",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Selecting <strong>YES</strong> will immediately trigger an urgent
            doctor alert regardless of symptom score.
          </p>
        </div>

        {/* Options */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {[
            {
              val: true,
              label: "Yes",
            },
            {
              val: false,
              label: "No",
            },
          ].map((opt) => {
            const selected = value === opt.val;
            const optionCritical = opt.val === criticalValue;

            return (
              <button
                key={String(opt.val)}
                onClick={() => handleSelect(opt.val)}
                style={{
                  padding: "13px 8px",
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",

                  border: `2px solid ${
                    selected
                      ? optionCritical
                        ? "#dc2626"
                        : "#16a34a"
                      : optionCritical
                      ? "#fecaca"
                      : "#86efac"
                  }`,

                  background: selected
                    ? optionCritical
                      ? "#dc2626"
                      : "#16a34a"
                    : optionCritical
                    ? "#fff7f7"
                    : "#f0fdf4",

                  color: selected
                    ? "#fff"
                    : optionCritical
                    ? "#dc2626"
                    : "#16a34a",

                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {selected && <span>✓</span>}
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        <div
          style={{
            height: 44,
            marginTop: 14,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {value !== undefined ? (
            <div
              style={{
                background: isCritical ? "#fee2e2" : "#f0fdf4",

                borderRadius: 24,
                padding: "9px 18px",

                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: isCritical ? "#dc2626" : "#16a34a",
                }}
              >
                ✓
              </span>

              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: isCritical ? "#dc2626" : "#16a34a",
                }}
              >
                {isCritical
                  ? "Alert triggered — doctor will be notified"
                  : "No alert triggered"}
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: "#c8cfe8",
                fontWeight: 500,
              }}
            >
              Select Yes or No
            </span>
          )}
        </div>

        <div
          style={{
            marginTop: 8,
            display: "flex",
            gap: 5,
            alignItems: "center",
          }}
        >
          <span style={{ color: "#7c3aed", fontSize: 12 }}>✦</span>

          <span
            style={{
              fontSize: 11,
              color: "#7c3aed",
            }}
          >
            Alert trigger verification question
          </span>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              background: "#fff",
              borderRadius: 18,
              padding: 22,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                margin: "0 auto 14px",
                borderRadius: "50%",
                background: "#fee2e2",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                fontSize: 26,
              }}
            >
              ⚠
            </div>

            <h3
              style={{
                textAlign: "center",
                margin: 0,
                color: "#991b1b",
              }}
            >
              Trigger Doctor Alert?
            </h3>

            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 1.6,
                marginTop: 12,
              }}
            >
              Selecting <strong>{criticalLabel}</strong> for:
              <br />
              <strong>{question.question_text}</strong>
              <br />
              will immediately notify the doctor and create a critical alert.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 18,
              }}
            >
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "1px solid #d1d5db",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                onClick={confirmCritical}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: "none",
                  background: "#dc2626",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Trigger Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}