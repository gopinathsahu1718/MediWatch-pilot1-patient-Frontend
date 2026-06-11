"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import BooleanQuestion from "@/components/monitoring/questionInputFormats/BooleanQuestion";
import RangeQuestion from "@/components/monitoring/questionInputFormats/RangeQuestion";
import LoadingScreen from "@/components/monitoring/LoadingScreen";
import ErrorScreen from "@/components/monitoring/ErrorScreen";
import {
  UnifiedQuestion,
  Answers,
  SubmissionResult,
  OverrideQuestion,
  DiseaseQuestion,
} from "@/components/monitoring/types";
import {
  fetchSymptomQuestions,
  submitAnswers,
} from "@/components/monitoring/apihelper";
import { getLabel } from "@/components/monitoring/helpers";
import ResultScreen from "@/components/monitoring/ResultScreen";

/* ─── Main Component ─── */
export default function DailyHealthUpdate() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [allQuestions, setAllQuestions] = useState<UnifiedQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitRef = useRef<HTMLDivElement | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number>(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  /* fetch questions on mount */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const data = await fetchSymptomQuestions();

        const disease = data.diseaseQuestions.map((q) => ({
          ...q,
          isOverride: false,
        }));

        const override = data.overrideQuestions.map((q) => ({
          ...q,

          isOverride: true,

          question_type: "boolean" as const,
        }));

        setAllQuestions([...disease, ...override]);
      } catch (e: any) {
        switch (e.status) {
          case 409:
            setError(e.message || "You already submitted today's update.");

            break;

          default:
            setError(e.message || "Failed to load questions");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allDone =
    allQuestions.length > 0 &&
    allQuestions.every((q) => answers[q.question_key] !== undefined);
  const q: UnifiedQuestion | undefined = allQuestions[currentQ];
  const curVal = q ? answers[q.question_key] : undefined;

  /* AUTO = next question  */
  useEffect(() => {
    if (!autoScrollEnabled) return;

    if (curVal === undefined) return;

    if (currentQ >= allQuestions.length - 1) return;

    if (autoRef.current) {
      clearTimeout(autoRef.current);
    }

    autoRef.current = setTimeout(() => {
      const next = currentQ + 1;

      setCurrentQ(next);
      setExpandedQuestion(next);
    }, 500);

    return () => {
      if (autoRef.current) {
        clearTimeout(autoRef.current);
      }
    };
  }, [curVal, currentQ, autoScrollEnabled]);

  // useEffect(() => {
  //   if (autoScrollEnabled) {
  //     setExpandedQuestion(currentQ);
  //   }
  // }, [currentQ, autoScrollEnabled]);

  function handleAnswer(key: string, value: number | boolean): void {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function goToQuestion(idx: number): void {
    setAutoScrollEnabled(false);

    setCurrentQ(idx);
    setExpandedQuestion(idx);

    // NO scrolling
  }

  async function handleSubmit(): Promise<void> {
    if (!allDone) return;
    setSubmitting(true);
    try {
      const diseaseAnswers: Record<string, number> = {};
      const overrideAnswers: Record<string, boolean> = {};

      allQuestions.forEach((qItem) => {
        const val = answers[qItem.question_key];
        if (qItem.isOverride) {
          if (typeof val === "boolean") {
            overrideAnswers[qItem.question_key] = val;
          }
        } else {
          if (typeof val === "number") {
            diseaseAnswers[qItem.question_key] = val;
          }
        }
      });

      const res = await submitAnswers({
        answers: diseaseAnswers,
        overrideAnswers,
      });
      setResult(res);
      setSubmitted(true);
    } catch (e : any) {
      switch (e.status) {
        case 409:
          setError("Today's update already submitted.");

          break;

        case 400:
          setError(e.message || "Invalid answers.");

          break;

        case 403:
          setError("Monitoring inactive.");

          break;

        default:
          setError(e.message || "Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll(): void {
    setAnswers({});
    setCurrentQ(0);
    setExpandedQuestion(0);
    setSubmitted(false);
    setAutoScrollEnabled(true);
    setResult(null);
    setError("");
  }

  /* auto scroll to submit button when all questions answered */
  useEffect(() => {
    if (!allDone) return;
    const timer = setTimeout(() => {
      submitRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [allDone]);

  useEffect(() => {
    return () => {
      if (autoRef.current) {
        clearTimeout(autoRef.current);
      }
    };
  }, []);

  function getAnswerDisplay(
    question: UnifiedQuestion,
    value: number | boolean | undefined,
  ): {
    text: string;
    emoji: string;
    color: string;
    bg: string;
  } {
    if (value === undefined) {
      return {
        text: "",
        emoji: "",
        color: "#3b4fd4",
        bg: "#eef1ff",
      };
    }

    if (question.isOverride) {
      return value
        ? {
            text: "Yes",
            emoji: "🚨",
            color: "#dc2626",
            bg: "#fee2e2",
          }
        : {
            text: "No",
            emoji: "✅",
            color: "#16a34a",
            bg: "#f0fdf4",
          };
    }

    if (typeof value === "number") {
      const info = getLabel(value);

      return {
        text: `${value} / 10 (${info.label})`,
        emoji: info.emoji,
        color: info.tc,
        bg: info.bg,
      };
    }

    return {
      text: String(value),
      emoji: "",
      color: "#3b4fd4",
      bg: "#eef1ff",
    };
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} resetAll={resetAll} />;
  }

  if (submitted && result) {
    return <ResultScreen result={result} resetAll={resetAll} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* Step bar */}
      <div
        className="top-[60px] md:top-0"
        style={{
          position: "sticky",

          zIndex: 20,
          background: "#fff",
          padding: "12px 16px",
          borderBottom: "1px solid #e8ecf8",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "#3b4fd4",
            }}
          >
            Question {currentQ + 1}/{allQuestions.length}
          </p>

          <button
            onClick={() => {
              setAutoScrollEnabled((v) => {
                const nv = !v;
                if (nv) {
                  setExpandedQuestion(currentQ);
                }
                return nv;
              });
            }}
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 20,
              border: "none",
              background: autoScrollEnabled ? "#eef1ff" : "#f3f4f6",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            {autoScrollEnabled ? <Pause size={14} /> : <Play size={14} />}
            <span style={{ fontSize: 11, fontWeight: 700 }}>
              {autoScrollEnabled ? "AUTO" : "MANUAL"}
            </span>
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          {allQuestions.map((qi, i) => {
            const done = answers[qi.question_key] !== undefined;
            const active = i === currentQ;

            return (
              <button
                key={qi.question_key}
                onClick={(e) => {
                  e.stopPropagation();
                  goToQuestion(i);
                }}
                style={{
                  minWidth: 34,
                  height: 34,
                  borderRadius: 12,
                  border: active
                    ? "2px solid #3b4fd4"
                    : done
                      ? "2px solid #22c55e"
                      : "1px solid #dbe1f0",
                  background: active ? "#eef1ff" : done ? "#f0fdf4" : "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {done ? "✓" : i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions list */}
      <div
        style={{
          margin: "0 auto",
          maxWidth: 900,
          padding: "10px  5px",
          display: "grid",
          gap: 12,
        }}
      >
        {allQuestions.map((qi, i) => {
          const done = answers[qi.question_key] !== undefined;
          const active = i === currentQ;
          const expanded = expandedQuestion === i;

          return (
            <div
              className="border border-stone-300 "
              key={qi.question_key}
              style={{
                background: "#fff",
                scrollMarginTop: 180,
                borderRadius: 18,

                boxShadow: "0 2px 10px rgba(59,79,212,.05)",
              }}
            >
              <div
                onClick={() => goToQuestion(i)}
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                }}
              >
                {/* Left number */}
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    background: active
                      ? "#eef1ff"
                      : done
                        ? "#f0fdf4"
                        : "#f7f8ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>

                {/* Question */}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: active ? 700 : 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {qi.question_text}
                  </p>
                </div>

                {/* Submitted answer */}
                {done &&
                  (() => {
                    const ans = getAnswerDisplay(qi, answers[qi.question_key]);

                    return (
                      <div
                        style={{
                          color: ans.color,
                          fontSize: 11,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            lineHeight: 1,
                          }}
                        >
                          {ans.emoji}
                        </span>

                        <span>{ans.text}</span>
                      </div>
                    );
                  })()}
              </div>

              {expanded && (
                <div style={{ padding: "0 16px 18px" }}>
                  {qi.isOverride ? (
                    <BooleanQuestion
                      question={qi as OverrideQuestion}
                      value={answers[qi.question_key] as boolean | undefined}
                      onChange={(val) => {
                        handleAnswer(qi.question_key, val);
                        if (autoScrollEnabled) {
                          setCurrentQ(i);
                        }
                      }}
                    />
                  ) : (
                    <RangeQuestion
                      autoScrollEnabled={autoScrollEnabled}
                      question={qi as DiseaseQuestion}
                      value={answers[qi.question_key] as number | undefined}
                      onChange={(val) => {
                        handleAnswer(qi.question_key, val);
                        if (autoScrollEnabled) {
                          setCurrentQ(i);
                        }
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button — shown when all questions including override are answered */}
      {allDone && (
        <div ref={submitRef} style={{ margin: "10px 16px 20px" }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              padding: 16,
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              background: submitting
                ? "#e8eaf5"
                : "linear-gradient(135deg,#1d9e75,#1d9e75)",
              color: submitting ? "#9aa3c8" : "#fff",
              boxShadow: submitting ? "none" : "0 4px 14px rgba(59,79,212,.28)",
              transition: "all .25s",
            }}
          >
            {submitting ? "Submitting…" : "Submit Daily Update ›"}
          </button>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          margin: "0 16px 24px",
          background: "#fff",
          borderRadius: 14,
          padding: "13px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 8px rgba(59,79,212,.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: "50%",
              background: "#eef1ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
            }}
          >
            🔒
          </div>
          <div>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#1e2a5e",
                margin: "0 0 2px",
              }}
            >
              Your data is safe with us
            </p>
            <p style={{ fontSize: 11, color: "#9aa3c8", margin: 0 }}>
              Private and used only for your care.
            </p>
          </div>
        </div>
        <span style={{ fontSize: 24 }}>📋</span>
      </div>
    </div>
  );
}
