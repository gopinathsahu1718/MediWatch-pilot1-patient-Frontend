import { CheckCircle2, WifiOff, AlertTriangle, Clock3 } from "lucide-react";

type ErrorScreenProps = {
  error: string;

  resetAll: () => void;
};

export default function ErrorScreen({
  error,

  resetAll,
}: ErrorScreenProps) {
  const isSubmitted = error.toLowerCase().includes("already submitted");

  const isNetwork =
    error.toLowerCase().includes("internet") ||
    error.toLowerCase().includes("connection");

  const isInactive = error.toLowerCase().includes("inactive");

  function handleRetry() {
    if (isNetwork) {
      window.location.reload();

      return;
    }

    resetAll();
  }

  return (
    <div
      className="
    flex
    items-center
    justify-center
    min-h-[calc(100vh-140px)]
    px-6
    py-8
    "
    >
      <div
        className="
      w-full
      max-w-md
      rounded-[28px]
      border
      border-slate-200
      bg-white
      p-8
      text-center
      shadow-sm
      "
      >
        <div
          style={{
            display: "flex",

            justifyContent: "center",

            marginBottom: 18,
          }}
        >
          {isSubmitted ? (
            <div
              style={{
                width: 70,

                height: 70,

                borderRadius: "50%",

                background: "#f0fdf4",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={34} color="#16a34a" />
            </div>
          ) : isNetwork ? (
            <div
              style={{
                width: 70,

                height: 70,

                borderRadius: "50%",

                background: "#eff6ff",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <WifiOff size={34} color="#2563eb" />
            </div>
          ) : isInactive ? (
            <div
              style={{
                width: 70,

                height: 70,

                borderRadius: "50%",

                background: "#fef3c7",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <Clock3 size={34} color="#d97706" />
            </div>
          ) : (
            <div
              style={{
                width: 70,

                height: 70,

                borderRadius: "50%",

                background: "#fee2e2",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <AlertTriangle size={34} color="#dc2626" />
            </div>
          )}
        </div>

        <h2
          style={{
            fontSize: 18,

            fontWeight: 700,

            marginBottom: 8,

            color: "#1e2a5e",
          }}
        >
          {isSubmitted
            ? "Today's Update Completed"
            : isNetwork
              ? "No Internet"
              : isInactive
                ? "Monitoring Inactive"
                : "Something went wrong"}
        </h2>

        <p
          style={{
            fontSize: 13,

            color: "#6b7bb3",

            marginBottom: 24,
          }}
        >
          {error}
        </p>

        {!isSubmitted && !isInactive && (
          <button
            onClick={handleRetry}
            style={{
              width: "100%",

              padding: 14,

              background: "linear-gradient(135deg,#3b4fd4,#6366f1)",

              color: "#fff",

              border: "none",

              borderRadius: 14,

              fontWeight: 700,
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
