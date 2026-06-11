"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  Activity,
  AlertTriangle,
  ChevronRight,
  X,
  HeartPulse,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";

import { ArrowUpDown } from "lucide-react";

type SortOrder = "newest" | "oldest";

import { apiFetch } from "@/lib/api";

type Submission = {
  day_number: number;
  status: "missed" | "submitted";
  submitted_at_ist: string;
  disease_score: number;
  priority_value: number;

  trend_status: "green" | "yellow" | "red" | "pending";

  override_triggered: boolean;

  images: string[];

  answers?: {
    question_key: string;
    question_text: string;
    value: number;
  }[];

  override_answers?: {
    question_key: string;
    question_text: string;
    value: boolean;
  }[];
};

type AlertItem = {
  id: string;
  alert_type: "green" | "yellow" | "red";
  alert_status: "pending" | "in_process" | "resolved";

  created_at_ist: string;

  resolved_at_ist?: string | null;
  in_process_at_ist?: string | null;

  resolution_note?: string | null;
  resolution_category?: string | null;

  in_process_by_name?: string | null;
  resolved_by_name?: string | null;

  escalated?: boolean;

  submission_day_number?: number;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<Submission[]>([]);

  const [selectedDay, setSelectedDay] = useState<Submission | null>(null);

  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  const [loading, setLoading] = useState(true);

  const [detailLoading, setDetailLoading] = useState(false);

  const [error, setError] = useState("");

  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  async function fetchHistory() {
    try {
      setLoading(true);

      const [historyResponse, alertsResponse] = await Promise.all([
        apiFetch("/api/v1/patient/history"),
        apiFetch("/api/v1/patient/alerts/status"),
      ]);

      setHistory(historyResponse.timeline || []);
      setAlerts(alertsResponse.alerts || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSingleDay(item: Submission) {
    if (item.status === "missed") {
      setSelectedDay(item);
      return;
    }

    try {
      setDetailLoading(true);

      const data = await apiFetch(`/api/v1/patient/history/${item.day_number}`);

      setSelectedDay(data);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  const trendStyles = {
    green: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",

      label: "Green",

      icon: CheckCircle2,
    },

    yellow: {
      bg: "bg-yellow-50",

      text: "text-yellow-600",

      border: "border-yellow-200",

      label: "Yellow",

      icon: AlertTriangle,
    },

    red: {
      bg: "bg-red-50",

      text: "text-red-600",

      border: "border-red-200",

      label: "Red",

      icon: HeartPulse,
    },

    pending: {
      bg: "bg-blue-50",

      text: "text-blue-600",

      border: "border-blue-200",

      label: "Pending",

      icon: CalendarDays,
    },
  };

  const sortedHistory = [...history].sort((a, b) => {
    const dayDiff =
      sortOrder === "newest"
        ? b.day_number - a.day_number
        : a.day_number - b.day_number;

    if (dayDiff !== 0) return dayDiff;

    const aTime = a.submitted_at_ist
      ? new Date(a.submitted_at_ist).getTime()
      : 0;

    const bTime = b.submitted_at_ist
      ? new Date(b.submitted_at_ist).getTime()
      : 0;

    return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
  });

  const selectedDayAlerts =
    selectedDay && selectedDay.status !== "missed"
      ? alerts.filter(
          (alert) => alert.submission_day_number === selectedDay.day_number,
        )
      : [];

  if (loading)
    return (
      <div className="space-y-3 mx-auto px-1 md:px-20">
        <div className="font-bold px-2 md:text-xl">Total Submissions</div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-3xl bg-white animate-pulse" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="mx-auto px-1 md:px-20">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-center">
          <h2 className="text-sm text-red-700">{error}</h2>
        </div>
      </div>
    );

  return (
    <div className="space-y-4 mx-auto px-1 md:px-20">
      <div className="flex items-center justify-between px-2">
        <h1 className="font-bold md:text-xl">Total Submissions</h1>

        <button
          onClick={() =>
            setSortOrder((p) => (p === "newest" ? "oldest" : "newest"))
          }
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium shadow-sm"
        >
          <ArrowUpDown size={14} />

          {sortOrder === "newest" ? "Newest → Oldest" : "Oldest → Newest"}
        </button>
      </div>

      <div className="space-y-2">
        {sortedHistory.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ClipboardList size={24} className="text-blue-500" />
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              No Submissions Yet
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              You haven&apos;t submitted any assessments yet.
            </p>
          </div>
        ) : (
          sortedHistory.map((item) => {
            const isMissed = item.status === "missed"

            const trend = !isMissed ? trendStyles[item.trend_status] : null;

            const Icon = isMissed ? AlertTriangle : trend?.icon || CheckCircle2;

            return (
              // existing card
              <button
                key={item.day_number}
                onClick={() => fetchSingleDay(item)}
                className={`
                w-full
                rounded-[22px]
                p-4
                text-left
                transition
                cursor-pointer
                border
                shadow-sm

                ${isMissed ? "border-red-200 bg-red-50/40" : "border-stone-200 bg-white"}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <div
                      className={`
    h-10
    w-10
    rounded-2xl
    flex
    items-center
    justify-center
    ${isMissed ? "bg-red-50" : "bg-white"}
  `}
                    >
                      <Icon size={16} className={trend?.text} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">
                        Day {item.day_number}
                      </h3>

                      {isMissed ? (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          Daily submission missed
                        </p>
                      ) : (
                        <p className="mt-1 text-[11px] text-slate-500">
                          Submitted{" "}
                          {new Date(item.submitted_at_ist).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {isMissed ? (
                        <>
                          <p className="text-[10px] text-red-400">Status</p>

                          <h2 className="text-sm font-bold text-red-500">
                            Missed
                          </h2>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] text-slate-500">Score</p>

                          <h2 className={`text-sm font-bold ${trend?.text}`}>
                            {item.disease_score}
                          </h2>
                        </>
                      )}
                    </div>

                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>

                <div className="mt-3 flex gap-2 flex-wrap">
                  {isMissed ? (
                    <div></div>
                  ) : (
                    <>
                      <div
                        className={`
        rounded-full
        px-2
        py-1
        text-[10px]
        ${trend?.bg}
        ${trend?.text}
      `}
                      >
                        {trend?.label}
                      </div>

                      {item.override_triggered && (
                        <div className="rounded-full bg-red-50 px-2 py-1 text-[10px] text-red-500">
                          Override Triggered
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {selectedDay && (
        <div className="fixed inset-0 z-50 bg-black/30 p-3 flex items-end md:items-center justify-center">
          <div className="w-full max-w-lg px-2 bg-white max-h-[85vh] sm:max-h-[90vh] overflow-auto modal-scroll">
            <div className="sticky top-0 border-b border-stone-200 bg-white p-4 flex justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Day {selectedDay.day_number}
                </h2>

                <p className="text-xs text-slate-500">Details</p>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="h-8 w-8 rounded-xl bg-slate-200 cursor-pointer flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-4">
              {/* Summary */}
              {selectedDay.status === "missed" ? (
                <>
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
                        <AlertTriangle size={20} className="text-red-400" />
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-red-500">
                          Submission Missed
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-red-500">
                          No health assessment was submitted for Day{" "}
                          {selectedDay.day_number}.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Day Information
                    </h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          Status
                        </span>

                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                          Missed
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-700">
                          Day Number
                        </span>

                        <span className="text-xs font-bold text-slate-800">
                          Day {selectedDay.day_number}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs leading-5 text-amber-700">
                      Missing daily submissions can make it harder for your care
                      team to track your recovery accurately. Try to submit your
                      assessment regularly.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {" "}
                  <div
                    className={`
                      rounded-2xl
                      border
                      p-3
                      ${trendStyles[selectedDay.trend_status].bg}
                      ${trendStyles[selectedDay.trend_status].border}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex w-full items-center justify-between">
                        <p className="text-xs font-medium text-black">
                          Disease Score
                        </p>

                        <h2
                          className={`mt-0.5 text-2xl font-bold leading-none ${
                            trendStyles[selectedDay.trend_status].text
                          }`}
                        >
                          {selectedDay.disease_score}
                        </h2>
                      </div>
                    </div>

                    <div className="my-2 border-t border-stone-300" />

                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Override Triggered
                        </span>

                        <span className="text-xs font-bold text-right text-slate-800">
                          {selectedDay.override_triggered ? "Yes" : "No"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-700">
                          Priority Score
                        </span>

                        <span className="text-xs font-bold text-slate-800">
                          {selectedDay.priority_value}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                          Submitted At
                        </span>

                        <span className="text-xs text-right text-slate-800">
                          {new Date(
                            selectedDay.submitted_at_ist,
                          ).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          Trend Status
                        </span>

                        <span
                          className={`
          rounded-full
          px-2 py-0.5
          text-[11px]
          font-semibold
          border
          ${trendStyles[selectedDay.trend_status].bg}
          ${trendStyles[selectedDay.trend_status].text}
        `}
                        >
                          {trendStyles[selectedDay.trend_status].label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedDayAlerts.length > 0 && (
                    <div>
                      <div className="space-y-3">
                        {selectedDayAlerts.map((alert) => {
                          const alertTrend =
                            trendStyles[
                              alert.alert_type as keyof typeof trendStyles
                            ];

                          const AlertIcon = alertTrend.icon;

                          return (
                            <div
                              key={alert.id}
                              className={`
              rounded-2xl
              border
              px-3 py-1.5
              ${alertTrend.bg}
              ${alertTrend.border}
            `}
                            >
                              {/* Header */}

                              <div className="flex items-start gap-3">
                                
                                <div className="flex-1 h-11">
                                  <div className="flex flex-wrap items-center justify-between gap-2 h-full ">
                                    <span
                                      className={`text-[12px] font-bold ${alertTrend.text}`}
                                    >
                                      {alert.alert_type.toUpperCase()} ALERT
                                    </span>

                                    <span
                                      className={`
                      rounded-full
                      px-2 py-0.5
                      text-[10px]
                      font-semibold

                      ${
                        alert.alert_status === "resolved"
                          ? "bg-emerald-100 text-emerald-700"
                          : alert.alert_status === "in_process"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }
                    `}
                                    >
                                      {alert.alert_status
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </span>

                                    {alert.escalated && (
                                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                        ESCALATED
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Details */}

                              <div className=" space-y-2 border-t border-white/70 mt-1">
                                {alert.resolved_at_ist && (
                                  <div className="flex justify-between gap-4 items-center">
                                    <span className="text-xs text-slate-800">
                                      Resolved At
                                    </span>

                                    <div className="text-right">
                                      <div className="text-xs font-medium text-slate-800">
                                        {new Date(
                                          alert.resolved_at_ist,
                                        ).toLocaleString("en-GB", {
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                          hour12: true,
                                        })}
                                      </div>

                                      {alert.resolved_by_name && (
                                        <div className="text-[10px] text-slate-500">
                                          by {alert.resolved_by_name}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {alert.resolution_category && (
                                  <div className="flex justify-between gap-4 items-center">
                                    <span className="text-xs text-slate-800">
                                      Resolution Category
                                    </span>

                                    <span className="rounded-full bg-blue-100 px-2 py-2 text-[10px] font-semibold text-blue-700">
                                      {alert.resolution_category
                                        .replaceAll("_", " ")
                                        .toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {alert.resolution_note && (
                                <div className="mt-4 rounded-xl bg-white p-3 border border-stone-200">
                                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-700">
                                    Resolution Note
                                  </p>

                                  <p className="text-xs leading-5 text-slate-700">
                                    {alert.resolution_note}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Disease Questions */}
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-sm font-semibold">
                        Disease Questions
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {selectedDay.answers?.map((item, index) => (
                        <div
                          key={item.question_key}
                          className="rounded-2xl border border-slate-300 bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center justify-center gap-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600">
                                  {index + 1}
                                </div>
                              </div>

                              <p className="text-xs inline-block leading-relaxed text-slate-700">
                                {item.question_text}
                              </p>
                            </div>

                            <div
                              className="
              flex h-6 w-6 shrink-0
              items-center justify-center
              rounded-2xl
              bg-blue-50
              text-sm
              font-bold
              
            "
                            >
                              {item.value}/10
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Override Questions */}
                  {selectedDay.override_answers &&
                    selectedDay.override_answers.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <AlertTriangle size={16} className="text-red-500" />

                          <h3 className="text-sm font-semibold text-slate-900">
                            Emergency Override Questions
                          </h3>
                        </div>

                        <div className="space-y-3">
                          {selectedDay.override_answers.map((item, index) => (
                            <div
                              key={item.question_key}
                              className="rounded-2xl border  p-3"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center justify-center gap-3">
                                  <div className=" flex items-center gap-2">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600">
                                      {index + 1}
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium text-slate-700">
                                    {item.question_text}
                                  </p>
                                </div>

                                <span
                                  className={`
                  rounded-full
                  px-3 py-1
                  text-xs font-semibold
                  ${
                    item.value
                      ? "bg-red-100 text-red-700"
                      : " bg-emerald-100 text-emerald-700"
                  }
                `}
                                >
                                  {item.value ? "Yes" : "No"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
