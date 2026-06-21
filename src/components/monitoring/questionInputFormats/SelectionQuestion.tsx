import { DiseaseQuestion } from "../types";
import { getSelectionLabel } from "../helpers";

interface Props {
  autoScrollEnabled: boolean;
  question: DiseaseQuestion;
  value?: number;
  onChange: (value: number) => void;
}



export default function SelectionQuestion({
  autoScrollEnabled,
  question,
  value,
  onChange,
}: Props) {
  const options = question.question_options || [];

  const selectedOption = options.find((o) => o.value === value);

  return (
    <div>
      {/* Options Row */}
      <div className="flex gap-2 sm:gap-6  text-xs mt-4 sm:mx-10">
        {options.map((option) => {
          const selected = value === option.value;

          const info = getSelectionLabel(
            option.value,
            question.min_value,
            question.max_value,
          );

          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                flex-1 rounded-4xl border-2 px-1 py-2 sm:p-3 
                text-center
                cursor-pointer
              `}
              style={{
                borderColor: info.color,

                background: selected ? info.bg : "#ffffff",

                color: selected ? info.tc : "#374151",
              }}
            >
              <div className="text-[11px] sm:text-xs font-semibold">
                {option.label}{" "}
                <span className="hidden sm:inline">{info.emoji}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Labels Row */}
      <div className="mt-1 flex gap-4 justify-around px-1 sm:mx-10">
        <span className="text-[10px] font-bold text-green-600">Stable</span>

        {options.length >= 3 && (
          <span className="text-[10px] font-bold text-yellow-600">
            Moderate
          </span>
        )}

        <span className="text-[10px] font-bold text-red-600">Critical</span>
      </div>

      {/* Selected Chip */}
      <div className=" flex h-11 items-center justify-center">
        {selectedOption && (
          <div
            style={{
              height: 44,
              
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
                <span
                  style={{
                    color: "#3b4fd4",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  ✓
                </span>

                <span
                  style={{
                    fontSize: 10,
                    color: "#3b4fd4",
                    fontWeight: 500,
                  }}
                >
                  You selected:{" "}
                  <strong
                    style={{
                      color: getSelectionLabel(
                        value,
                        question.min_value,
                        question.max_value,
                      ).color,
                    }}
                  >
                    {
                      question.question_options?.find((x) => x.value === value)
                        ?.label
                    }
                    {" ("}
                    {
                      getSelectionLabel(
                        value,
                        question.min_value,
                        question.max_value,
                      ).label
                    }
                    {")"}
                  </strong>
                </span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center gap-1">
        <span className="text-xs text-violet-600">✦</span>

        <span className="text-[11px] text-violet-600">
          {autoScrollEnabled
            ? "We'll save this and show you the next question automatically"
            : "Manually select next question or switch to auto mode."}
        </span>
      </div>
    </div>
  );
}
