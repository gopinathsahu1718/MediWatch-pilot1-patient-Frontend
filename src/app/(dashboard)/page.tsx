"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock3,
  TrendingUp,
  LucideIcon,
  AlertTriangle,
  HeartPulse,
  CalendarDays,
} from "lucide-react";

import { CalendarClock, User, FileText, ShieldAlert, X } from "lucide-react";

import { apiFetch } from "@/lib/api";

type DashboardData = {
  name: string;
  currentDay: number;
  totalDays: number;
  todaySubmitted: boolean;
  lastSubmittedAt: string;
  trendStatus: "green" | "yellow" | "red" | "pending";
  doctorName: string;
};

type RecentSubmission = {
  day_number: number;

  status: "submitted" | "missed";

  submitted_at_ist: string | null;

  disease_score: number | null;

  trend_status: "green" | "yellow" | "red";

  override_triggered: boolean;
};

type AlertItem = {
  id: string;
  alert_type: "green" | "yellow" | "red";
  alert_status: "pending" | "in_process" | "resolved";
  created_at_ist: string;

  in_process_at_ist?: string | null;
  resolved_at_ist?: string | null;

  resolution_note?: string | null;
  resolution_category?: string | null;

  in_process_by_name?: string | null;
  resolved_by_name?: string | null;

  reminder_count?: number;
  escalated?: boolean;

  submission_day_number?: number;
};

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

function getHeroMessage({
  name,
  trendStatus,
  todaySubmitted,
  currentDay,
  totalDays,
}: {
  name: string;
  trendStatus: "green" | "yellow" | "red" | "pending";
  todaySubmitted: boolean;
  currentDay: number;
  totalDays: number;
}) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "🌤️ Good Morning"
      : hour < 17
        ? "☀️ Good Afternoon"
        : "🌙 Good Evening";

  const progress = Math.round((currentDay / totalDays) * 100);

  if (trendStatus === "pending") {
    return {
      title: currentDay <= 1 ? `👋 Welcome, ${name}` : `${greeting}, ${name}`,
      message:
        currentDay <= 1
          ? "Today marks the beginning of your recovery journey. Let's start with your first health update."
          : `You're currently on Day ${currentDay}. Submit today's update to continue tracking your progress.`,
    };
  }

  if (trendStatus === "green") {
    return todaySubmitted
      ? {
          title: `${greeting}, ${name}`,
          message: `Great job completing today's check-in. You're ${progress}% through your monitoring journey and progressing well.`,
        }
      : {
          title: `${greeting}, ${name}`,
          message: `You're doing well overall. Submit today's update to keep your positive progress on track.`,
        };
  }

  if (trendStatus === "yellow") {
    return todaySubmitted
      ? {
          title: `${greeting}, ${name}`,
          message:
            "Thanks for checking in today. Consistent updates help us better understand your recovery progress.",
        }
      : {
          title: `${greeting}, ${name}`,
          message:
            "We haven't received today's update yet. A quick check-in will help keep your recovery journey on track.",
        };
  }

  return todaySubmitted
    ? {
        title: `${greeting}, ${name}`,
        message:
          "Thank you for completing today's update. Your care team is monitoring your recovery closely and supporting you along the way.",
      }
    : {
        title: `${greeting}, ${name}`,
        message:
          "Your update is important today. Please complete your check-in so we can continue monitoring your condition closely.",
      };
}

export default function HomePage() {
  const router = useRouter();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [recentActivity, setRecentActivity] = useState<RecentSubmission[]>([]);

  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    fetchDashboard();

    fetchRecentActivity();
  }, []);

  async function fetchRecentActivity() {
    try {
      const historyData = await apiFetch<{
        timeline: RecentSubmission[];
      }>("/api/v1/patient/history");

      const alertsResponse = await apiFetch<{
        alerts: AlertItem[];
      }>("/api/v1/patient/alerts/status");

      const sortedTimeline = [...(historyData.timeline || [])].sort(
        (a, b) => b.day_number - a.day_number,
      );

      const latestTimeline = sortedTimeline.slice(0, 4);

      let streak = 0;

      for (const item of sortedTimeline) {
        if (item.status === "submitted") {
          streak++;
        } else {
          break;
        }
      }

      const latestAlerts = [...(alertsResponse.alerts || [])]
        .sort(
          (a, b) =>
            new Date(b.created_at_ist).getTime() -
            new Date(a.created_at_ist).getTime(),
        )
        .slice(0, 1);

      setCurrentStreak(streak);
      setRecentActivity(latestTimeline);
      setRecentAlerts(latestAlerts);
    } catch (err) {
      console.log(err);
    }
  }

  async function fetchDashboard() {
    try {
      setLoading(true);

      setError("");

      const data = await apiFetch<DashboardData>("/api/v1/patient/dashboard");

      setDashboard(data);
    } catch (err: any) {
      console.log(err);

      switch (err.status) {
        case 401:
          setError("Session expired");
          break;

        case 404:
          setError("Dashboard not found");
          break;

        case 408:
          setError("Request timeout");
          break;

        default:
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const hero = getHeroMessage({
    name: dashboard?.name || "Patient",
    trendStatus: dashboard?.trendStatus || "pending",
    todaySubmitted: dashboard?.todaySubmitted || false,
    currentDay: dashboard?.currentDay || 1,
    totalDays: dashboard?.totalDays || 1,
  });

  if (loading) {
    return (
      <div className="space-y-4 mx-auto md:px-20 px-2">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[24px] bg-white p-5 shadow-sm h-[140px] mb-2">
          <div className="h-3 w-20 rounded bg-slate-100" />

          <div className="mt-3 h-7 w-40 rounded bg-slate-100" />

          <div className="mt-8">
            <div className="mb-2 flex justify-between">
              <div className="h-2 w-16 rounded bg-slate-100" />

              <div className="h-2 w-12 rounded bg-slate-100" />
            </div>

            <div className="h-2 rounded-full border border-slate-200">
              <div className="h-full w-1/2 rounded-full bg-slate-100" />
            </div>
          </div>

          <div className="absolute inset-0 shimmer" />
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 gap-1 lg:grid-cols-4 mb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="
              relative overflow-hidden
              rounded-2xl
              bg-white
              p-3 sm:p-4
              border border-slate-100
              shadow-sm
            "
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />

                <div className="ml-4">
                  <div className="h-2 w-12 rounded bg-slate-100" />

                  <div className="mt-2 h-4 w-16 rounded bg-slate-100" />
                </div>
              </div>

              <div className="absolute inset-0 shimmer" />
            </div>
          ))}
        </section>

        {/* RECENT ACTIVITY */}
        <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-slate-100" />

            <div className="h-3 w-10 rounded bg-slate-100" />
          </div>

          <div className="space-y-2">
            {[1].map((i) => (
              <div
                key={i}
                className="
                relative overflow-hidden
                rounded-[20px]
                border border-slate-300
                bg-slate-50/70
                p-3
              "
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-slate-100" />

                    <div>
                      <div className="h-3 w-16 rounded bg-slate-100" />

                      <div className="mt-2 h-2 w-24 rounded bg-slate-100" />
                    </div>
                  </div>

                  <div>
                    <div className="h-2 w-8 rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-10 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="absolute inset-0 shimmer" />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-slate-100" />

            <div className="h-3 w-10 rounded bg-slate-100" />
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="
                relative overflow-hidden
                rounded-[20px]
                border border-slate-300
                bg-slate-50/70
                p-3
              "
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-2xl bg-slate-100" />

                    <div>
                      <div className="h-3 w-16 rounded bg-slate-100" />

                      <div className="mt-2 h-2 w-24 rounded bg-slate-100" />
                    </div>
                  </div>

                  <div>
                    <div className="h-2 w-8 rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-10 rounded bg-slate-100" />
                  </div>
                </div>

                <div className="absolute inset-0 shimmer" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error)
    return (
      <div
        className="
      mx-auto
      px-1
      md:px-20
      "
      >
        <div
          className="
        rounded-3xl
        border
        border-red-200
        bg-red-50
        p-5
        text-center
        "
        >
          <h2
            className="
          text-sm
          
          text-red-700
          "
          >
            {error}
          </h2>
        </div>
      </div>
    );

  const trendMap = {
    green: {
      label: "Green",
      text: "text-emerald-600",
      variant: "success" as CardVariant,
      icon: TrendingUp,
    },

    yellow: {
      label: "Yellow",
      text: "text-yellow-600",
      variant: "warning" as CardVariant,
      icon: TrendingUp,
    },

    red: {
      label: "Red",
      text: "text-red-600",
      variant: "danger" as CardVariant,
      icon: TrendingUp,
    },

    pending: {
      label: "Pending",
      text: "text-blue-600",
      variant: "pending" as CardVariant,
      icon: Clock3,
    },
  };

  const trend = trendMap[dashboard?.trendStatus || "green"];

  const trendMessages = {
    green: {
      title: "Great Progress",
      message: "Your recovery is progressing well.",
    },

    yellow: {
      title: "Stay Consistent",
      message: "Continue monitoring your symptoms.",
    },

    red: {
      title: "We're Monitoring You",
      message: "Our care team is monitoring closely.",
    },

    pending: {
      title: "Get Started",
      message: "Submit your first update.",
    },
  };

  const trendInfo =
    trendMessages[
      (dashboard?.trendStatus || "pending") as keyof typeof trendMessages
    ];

  const progress =
    ((dashboard?.currentDay || 0) / (dashboard?.totalDays || 1)) * 100;

  const percentage = Math.round(progress);
  const daysLeft = (dashboard?.totalDays || 0) - (dashboard?.currentDay || 0);

  return (
    <div className="space-y-4 mx-auto md:px-20 px-2">
      {/* HERO */}

      {/* <div
        className="
        overflow-hidden

        rounded-[24px]

        bg-gradient-to-br from-emerald-100 via-white

        p-5

        shadow-sm

        border-stone-200
        border
        mb-2
      "
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-800">
              Dashboard
            </p>

            <h1 className="mt-1 text-xl font-bold">Hi, {dashboard?.name}</h1>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs ">
            <span>Progress</span>

            <span>
              {dashboard?.currentDay}/{dashboard?.totalDays}
            </span>
          </div>

          <div className="h-2 rounded-full bg-white/20 border-stone-400 border-[1px]">
            <div
              style={{
                width: `${progress}%`,
              }}
              className="h-full rounded-full bg-blue-400"
            />
          </div>
        </div>
      </div> */}

      <div
        className="
    overflow-hidden
    rounded-[24px]
    bg-gradient-to-br
    from-emerald-100
    via-white
    to-white
    p-5
    shadow-sm
    border
    border-stone-200
    mb-2
  "
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between  mb-2">
              <p className=" text-[12px] mt-2 md:text-xl font-bold text-slate-900">
                {hero.title}
              </p>

              <div
                className={`
          flex items-center gap-1.5
          rounded-full
          px-3 py-1.5
          border
          shadow-sm
          
          ${
            currentStreak > 0
              ? "bg-orange-50 border-orange-200"
              : "bg-slate-50 border-slate-200"
          }
        `}
              >
                <span className="text-sm">
                  {currentStreak > 0 ? "🔥" : "⚪"}
                </span>

                <span
                  className={`text-xs font-bold whitespace-nowrap ${
                    currentStreak > 0 ? "text-orange-600" : "text-slate-500"
                  }`}
                >
                  {currentStreak} <span className="text-[10px]">Day Streak</span>
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: 12,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ color: "#7c3fff", fontSize: 12 }}>✦</span>

              <span
                style={{ color: "#7c3aed" }}
                className="text-[10px] md:text-xs"
              >
                {hero.message}
              </span>
            </div>
          </div>
        </div>

        {/* STATUS MESSAGE */}

        {/* PROGRESS */}

        <div className="mt-5 mb-3 ">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">
              Monitoring Progress
            </span>

            <span className="text-xs font-semibold text-slate-700">
              {percentage}% Complete
            </span>
          </div>

          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              style={{
                width: `${progress}%`,
              }}
              className={`
          h-full
          rounded-full
          transition-all
         bg-blue-400
        `}
            />
          </div>
        </div>
      </div>

      {/* STATS */}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 mb-2">
        <Card
          icon={CheckCircle2}
          title="Today"
          value={dashboard?.todaySubmitted ? "Done" : "Pending"}
          variant={dashboard?.todaySubmitted ? "success" : "warning"}
        />

        <Card
          icon={trend.icon}
          title="Trend Status"
          value={trend.label}
          text={trend.text}
          variant={trend.variant}
        />

        <Card
          icon={Calendar}
          title="Day"
          value={String(dashboard?.currentDay)}
          variant="secondary"
        />

        <Card
          icon={Calendar}
          title="Total Days"
          value={`${dashboard?.totalDays}`}
          variant="secondary"
        />
      </div>

      {/* <div className="mb-2">
        <div
          className={`
      
      rounded-2xl
      p-3
      border
      bg-emerald-50
    `}
        >
          <p className="text-xs font-semibold text-slate-800">
            {trendInfo.title}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            {trendInfo.message}
          </p>
        </div>
      </div> */}
      {/* RECENT ALERTS */}

      <section className="rounded-[24px] bg-white p-4 shadow-sm border border-stone-200">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-slate-700" />

            <h2 className="text-sm font-semibold">Recent Alerts</h2>
          </div>
        </div>

        <div className="space-y-2">
          {recentAlerts.length === 0 ? (
            <div
              className="
        rounded-[20px]
        border
        border-dashed
        border-slate-300
        p-6
        text-center
      "
            >
              <AlertTriangle
                size={20}
                className="mx-auto mb-2 text-slate-400"
              />

              <h3 className="text-sm font-semibold">No Alerts Found</h3>

              <p className="mt-1 text-xs text-slate-500">
                No alerts have been generated yet.
              </p>
            </div>
          ) : (
            recentAlerts.map((alert) => {
              const styles =
                trendStyles[alert.alert_type as keyof typeof trendStyles];

              const Icon = styles.icon;

              const statusConfig = {
                pending: {
                  bg: "bg-amber-50",
                  text: "text-amber-500",
                  label: "Pending",
                },
                in_process: {
                  bg: "bg-yellow-100",
                  text: "text-yellow-700",
                  label: "In Process",
                },
                resolved: {
                  bg: "bg-emerald-50",
                  text: "text-emerald-700",
                  label: "Resolved",
                },
              };

              const status =
                statusConfig[alert.alert_status as keyof typeof statusConfig];

              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className="
        cursor-pointer
        rounded-3xl
        border
        border-stone-300
        bg-white
        p-4
        transition-all
        hover:border-stone-400
        hover:shadow-sm
      "
                >
                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`
              h-10
              w-10
              rounded-xl
              flex
              items-center
              justify-center
              
            `}
                      >
                        <Icon size={18} className={styles.text} />
                      </div>

                      <div className="min-w-0">
                        <h3 className={`text-xs font-semibold ${styles.text}`}>
                          {alert.alert_type.toUpperCase()} Alert
                        </h3>
                        <div className="mt-1 text-[10px] text-slate-600">
                          {alert.alert_status === "pending" && (
                            <div>
                              <span className="font-medium text-slate-700">
                                Created:
                              </span>{" "}
                              {new Date(alert.created_at_ist).toLocaleString(
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
                            </div>
                          )}

                          {alert.alert_status === "in_process" &&
                            alert.in_process_at_ist && (
                              <div>
                                <span className="font-medium text-yellow-700">
                                  In Process:
                                </span>{" "}
                                {new Date(
                                  alert.in_process_at_ist,
                                ).toLocaleString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                                {alert.in_process_by_name && (
                                  <span className="text-slate-500">
                                    {" "}
                                    · by {alert.in_process_by_name}
                                  </span>
                                )}
                              </div>
                            )}

                          {alert.alert_status === "resolved" &&
                            alert.resolved_at_ist && (
                              <div>
                                <span className="font-medium text-emerald-700">
                                  Resolved:
                                </span>{" "}
                                {new Date(alert.resolved_at_ist).toLocaleString(
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
                                {alert.resolved_by_name && (
                                  <span className="text-slate-500">
                                    {" "}
                                    · by {alert.resolved_by_name}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`
            px-3
            py-1.5
            mt-1
            rounded-full
            text-[12px]
            font-semibold
            whitespace-nowrap
            ${status.bg}
            ${status.text}
            border
          `}
                    >
                      {status.label}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className="
                  px-2.5
                  py-1
                  
                  rounded-full
                  text-[10px]
                  font-semibold
                  bg-slate-100
                  text-slate-700
                "
                    >
                      Day {alert.submission_day_number}
                    </span>

                    {alert.resolution_category && (
                      <span
                        className="
                    px-2.5
                    py-1
                    rounded-full
                    text-[10px]
                    font-semibold
                    bg-blue-50
                    text-blue-700
                  "
                      >
                        {alert.resolution_category
                          ?.split("_")
                          .join(" ")
                          .toLocaleUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* RECENT ACTIVITY */}

      <section className="rounded-[24px]  bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05) border border-stone-300">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-slate-700" />

            <h2 className="text-sm font-semibold">Recent Activity</h2>
          </div>

          <button
            onClick={() => router.push("/history")}
            className="
    text-[11px]
    font-medium
    text-blue-600
    hover:text-blue-700
    transition
  "
          >
            View All →
          </button>
        </div>
        <div className="space-y-2">
          {recentActivity.length === 0 ? (
            <div
              className="
      rounded-[20px]
      border
      border-dashed
      border-slate-300
      
      p-6
      text-center
      "
            >
              <div
                className="
        mx-auto
        mb-3
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-2xl
        bg-blue-50
        "
              >
                <Activity
                  size={20}
                  className="
          text-blue-600
          "
                />
              </div>

              <h3
                className="
        text-sm
        font-semibold
        text-slate-800
        "
              >
                No recent activity
              </h3>

              <p
                className="
        mt-1
        text-xs
        text-slate-500
        "
              >
                Start your daily submissions to track progress.
              </p>

              <button
                onClick={() => router.push("/monitoring")}
                className="
        mt-4
        rounded-xl
        bg-emerald-500
        px-4
        py-2
        text-xs
        font-medium
        text-white
        transition
        hover:bg-emerald-600
        "
              >
                Start Submission
              </button>
            </div>
          ) : (
            recentActivity.map((item) => {
              const isMissed = item.status === "missed";

              const trend = !isMissed
                ? trendStyles[item.trend_status as keyof typeof trendStyles]
                : null;

              const Icon = isMissed
                ? AlertTriangle
                : trend?.icon || CheckCircle2;

              return (
                <div
                  key={item.day_number}
                  onClick={() => router.push("/history")}
                  className={`
    rounded-[20px]
    border
    p-3
    transition-all

    ${isMissed ? "border-red-200 bg-red-50/50" : "border-stone-300 bg-white"}
  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                        <Icon
                          size={16}
                          className={isMissed ? "text-red-400" : trend?.text}
                        />
                      </div>

                      <div>
                        <h3 className="text-xs font-semibold">
                          Day {item.day_number}
                        </h3>

                        {isMissed ? (
                          <p className="mt-1 text-[10px] text-red-400 font-medium">
                            Daily submission missed
                          </p>
                        ) : (
                          <p className="mt-1 text-[10px] text-slate-500">
                            Submitted{" "}
                            {new Date(
                              item.submitted_at_ist || "",
                            ).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      {isMissed ? (
                        <>
                          <p className="text-[10px] text-red-500">Status</p>

                          <h4 className="text-xs font-bold text-red-600">
                            Missed
                          </h4>
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] text-slate-500">Score</p>

                          <h4
                            className={`
              text-xs
              font-bold
              ${trend?.text}
            `}
                          >
                            {item.disease_score}
                          </h4>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {isMissed ? (
                      <span></span>
                    ) : (
                      <>
                        <span
                          className={`
            px-2.5
            py-1
            rounded-full
            text-[10px]
            font-semibold
            ${trend?.bg}
            ${trend?.text}
          `}
                        >
                          {trend?.label}
                        </span>

                        {item.override_triggered && (
                          <span
                            className="
              px-2.5
              py-1
              rounded-full
              text-[10px]
              font-semibold
              bg-red-50
              text-red-500
            "
                          >
                            Override Triggered
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {selectedAlert && (
        <div
          className="
      fixed inset-0 z-50
      bg-black/40 backdrop-blur-sm
      flex items-end sm:items-center justify-center
      p-3
    "
          onClick={() => setSelectedAlert(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
        w-full
        max-w-2xl
        rounded-t-[28px]
        sm:rounded-[28px]
        bg-white
        overflow-hidden
        shadow-2xl
        max-h-[90vh]
        overflow-y-auto
      "
          >
            {(() => {
              const trend =
                trendStyles[
                  selectedAlert.alert_type as keyof typeof trendStyles
                ];

              const Icon = trend.icon;

              const statusStyles = {
                pending: "bg-amber-100 border text-amber-500",
                in_process: "bg-yellow-100 border text-yellow-700",
                resolved: "bg-emerald-100 border text-emerald-700",
              };

              return (
                <>
                  {/* HEADER */}

                  <div
                    className={`
                p-6
                border-b
                ${trend.bg}
                ${trend.border}
              `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 w-full">
                        <div
                          className="
                      h-14
                      w-14
                      rounded-2xl
                      bg-white
                      shadow-sm
                      flex
                      items-center
                      justify-center
                    "
                        >
                          <Icon size={26} className={trend.text} />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col w-full ">
                            <span
                              className={`
                         
                          rounded-full
                          text-xs
                          font-bold
                          ${trend.bg}
                          ${trend.text}
                        `}
                            >
                              {selectedAlert.alert_type.toUpperCase()} ALERT
                            </span>
                            <div className="flex justify-between items-center ">
                              <span className="text-sm font-semibold text-slate-700">
                                Day {selectedAlert.submission_day_number}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 ">
                              Created{" "}
                              {new Date(
                                selectedAlert.created_at_ist,
                              ).toLocaleString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedAlert(null)}
                        className="
                    h-10
                    w-10
                    rounded-xl
                    bg-white
                    shadow-sm
                    flex
                    items-center
                    justify-center
                    cursor-pointer
                  "
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  {/* CONTENT */}

                  <div className="p-6 space-y-5">
                    {(selectedAlert.in_process_at_ist ||
                      selectedAlert.resolved_at_ist) && (
                      <div
                        className="
                    rounded-2xl
                    border
                    border-slate-200
                    p-5
                    bg-slate-50
                  "
                      >
                        <h4
                          className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                      mb-4
                    "
                        >
                          Alert Timeline
                        </h4>

                        <div className="space-y-4">
                          {selectedAlert.in_process_at_ist && (
                            <div className="flex gap-3">
                              <div
                                className="
                            h-10
                            w-10
                            rounded-xl
                            bg-amber-100
                            flex
                            items-center
                            justify-center
                          "
                              >
                                <Clock3 size={16} className="text-amber-700" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-amber-700">
                                  In Process
                                </p>

                                <p className="text-sm text-slate-600">
                                  {new Date(
                                    selectedAlert.in_process_at_ist,
                                  ).toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>

                                {selectedAlert.in_process_by_name && (
                                  <p className="text-xs text-slate-500">
                                    by {selectedAlert.in_process_by_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {selectedAlert.resolved_at_ist && (
                            <div className="flex gap-3">
                              <div
                                className="
                            h-10
                            w-10
                            rounded-xl
                            bg-emerald-100
                            flex
                            items-center
                            justify-center
                          "
                              >
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-700"
                                />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-emerald-700">
                                  Resolved
                                </p>

                                <p className="text-sm text-slate-600">
                                  {new Date(
                                    selectedAlert.resolved_at_ist,
                                  ).toLocaleString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>

                                {selectedAlert.resolved_by_name && (
                                  <p className="text-xs text-slate-500">
                                    by {selectedAlert.resolved_by_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedAlert.resolution_category && (
                      <div>
                        <p
                          className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                      mb-2
                    "
                        >
                          Resolution Category
                        </p>

                        <div
                          className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-blue-50
                      border
                      border-blue-200
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-blue-700
                    "
                        >
                          <ShieldAlert size={15} />

                          {selectedAlert.resolution_category
                            ?.split("_")
                            .join(" ")
                            .toUpperCase()}
                        </div>
                      </div>
                    )}

                    {selectedAlert.escalated && (
                      <div
                        className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-red-50
                    border
                    border-red-200
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-red-700
                  "
                      >
                        <AlertTriangle size={15} />
                        Escalated Alert
                      </div>
                    )}

                    {selectedAlert.resolution_note && (
                      <div
                        className="
                    rounded-2xl
                    border
                    border-slate-200
                    bg-slate-50
                    p-5
                  "
                      >
                        <p
                          className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-slate-500
                      mb-3
                    "
                        >
                          Resolution Note
                        </p>

                        <p className="text-sm text-slate-700 leading-7">
                          {selectedAlert.resolution_note}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

type CardVariant =
  | "success"
  | "warning"
  | "danger"
  | "pending"
  | "primary"
  | "secondary";

type CardProps = {
  icon: LucideIcon; // can improve later with LucideIcon
  title: string;
  value: string;
  text?: string;
  variant?: CardVariant;
};

function Card({
  icon: Icon,
  title,
  value,
  text = "",
  variant = "primary",
}: CardProps) {
  const styles: Record<CardVariant, string> = {
    success: "from-emerald-50 to-emerald-100 text-emerald-600 ring-emerald-100",

    warning: "from-yellow-50 to-yellow-100 text-yellow-600 ring-yellow-100",

    danger: "from-red-50 to-red-100 text-red-600 ring-red-100",

    pending: "from-blue-50 to-blue-100 text-blue-600 ring-blue-100",

    primary: "from-green-50 to-green-100 text-black ring-green-200",

    secondary: "from-slate-50 to-slate-100 text-slate-600 ring-slate-100",
  };

  return (
    <div
      className="
      group
      rounded-2xl
      bg-white
      p-3 sm:p-4
      border border-slate-100
      shadow-sm
      transition-all
      
      hover:shadow-md
    "
    >
      <div className="flex items-center">
        <div
          className={`
            flex h-10 w-10 items-center justify-center
            rounded-xl bg-gradient-to-br
            ring-4
            ${styles[variant]}
          `}
        >
          <Icon size={18} />
        </div>

        <div className="ml-4">
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-800">
            {title}
          </p>

          <h3
            className={`
            mt-1
            text-base sm:text-lg
            font-bold
            text-slate-800
            ${text}
          `}
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}
