"use client";
import { useState, useEffect, useRef } from "react";
import { Play, Pause } from "lucide-react";
import BooleanQuestion from "@/components/monitoring/questionInputFormats/BooleanQuestion";
import RangeQuestion from "@/components/monitoring/questionInputFormats/RangeQuestion";
import LoadingScreen from "@/components/monitoring/LoadingScreen";
import ErrorScreen from "@/components/monitoring/ErrorScreen";
import SelectionQuestion from "@/components/monitoring/questionInputFormats/SelectionQuestion";
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
import { getLabel, getSelectionLabel } from "@/components/monitoring/helpers";
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
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");

  const MAX_IMAGES = 5;
  const MAX_SIZE = 5 * 1024 * 1024;

  const validateFiles = (files: File[]) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const validFiles: File[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setImageError(`${file.name}: Only JPG, PNG and WEBP are allowed`);
        continue;
      }

      if (file.size > MAX_SIZE) {
        setImageError(`${file.name}: Maximum size is 5MB`);
        continue;
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);

    setImageError("");

    const valid = validateFiles(selected);

    const merged = [...images, ...valid];

    if (merged.length > MAX_IMAGES) {
      setImageError("Maximum 5 images allowed");

      setImages(merged.slice(0, MAX_IMAGES));

      return;
    }

    setImages(merged);
  };
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

      if (images.length > 5) {
        setError("Maximum 5 images allowed.");

        return;
      }

      const res = await submitAnswers(
        {
          answers: diseaseAnswers,
          overrideAnswers,
        },
        images,
      );
      setResult(res);
      setSubmitted(true);
    } catch (e: any) {
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
          console.log(e);
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
    setImages([]);
    setImageError("");
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

  useEffect(() => {
    if (!imageError) return;

    const timer = setTimeout(() => {
      setImageError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [imageError]);

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
      if (question.question_type === "selection") {
        const option = question.question_options?.find(
          (x) => x.value === value,
        );

        const info = getSelectionLabel(
          value,
          question.min_value,
          question.max_value,
        );

        return {
          text: `${option?.label ?? value} (${info.label})`,
          emoji: info.emoji,
          color: info.tc,
          bg: info.bg,
        };
      }

      const info = getLabel(value);

      return {
        text: `${value} / ${question.max_value} (${info.label})`,
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
              className={`border border-stone-300  `}
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
                  ) : qi.question_type === "selection" ? (
                    <SelectionQuestion
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

      <div className="mx-2 mb-5 rounded-2xl border border-slate-300 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-xl">
            📸
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-800">
              Recovery Photos
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Optional. Upload photos to help your doctor monitor healing and
              recovery progress.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
            {images.length}/5
          </div>
        </div>

        <label
          className={`
      mt-4 flex cursor-pointer items-center justify-center gap-2
      rounded-2xl border-dashed 
      px-3 py-3 text-sm font-medium cursor-pointer shadow  transition-colors
      ${
        images.length >= 5
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : "border-slate-300 hover:border-blue-300 hover:bg-blue-50 text-indigo-700"
      }
    `}
        >
          <span>{images.length === 0 ? "Add Photos" : "Add More Photos"}</span>

          <input
            hidden
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            disabled={images.length >= 5}
            onChange={handleFiles}
          />
        </label>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          JPG, PNG, WEBP • Max 5MB each
        </p>

        {images.length > 0 && (
          <div className="mt-4 grid grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((file, index) => (
              <div
                key={index}
                className="
          group relative overflow-hidden
          rounded-2xl border
          border-slate-500
        "
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-20 w-full object-fill"
                />

                <button
                  type="button"
                  onClick={() =>
                    setImages((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="
            absolute right-2 top-2
            flex h-7 w-7 items-center
            justify-center rounded-full
            bg-black/70 text-xs
            font-bold text-white
          "
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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

      {imageError && (
        <div
          className="
      fixed left-4 right-4 top-4 z-50
      rounded-xl bg-red-500
      px-4 py-3 text-sm
      font-medium text-white
      shadow-lg
    "
        >
          {imageError}
        </div>
      )}
    </div>
  );
}
