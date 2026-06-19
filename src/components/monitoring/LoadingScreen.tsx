export default function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 900,
        margin: "0 auto",
        paddingBottom: 120,
        background: "#f4f7fb",
      }}
    >
      <style>
        {`
        @keyframes shimmer{
          0%{transform:translateX(-100%)}
          100%{transform:translateX(100%)}
        }

        .sk{
          position:relative;
          overflow:hidden;
          background:#eef1f7;
        }

        .sk::after{
          content:"";
          position:absolute;
          inset:0;
          background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,.7),
            transparent
          );
          animation:shimmer 1.2s infinite;
        }
      `}
      </style>

      {/* sticky header */}
      <div
        style={{
          background: "#fff",
          padding: "12px 16px",
          borderBottom: "1px solid #e8ecf8",
          position: "sticky",
          top: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div
            className="sk"
            style={{
              width: 110,
              height: 14,
              borderRadius: 8,
            }}
          />

          <div
            className="sk"
            style={{
              width: 90,
              height: 34,
              borderRadius: 20,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="sk"
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
              }}
            />
          ))}
        </div>
      </div>

      {/* question cards */}
      <div
        style={{
          padding: "10px 5px",
          display: "grid",
          gap: 12,
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 16,
              boxShadow: "0 2px 10px rgba(59,79,212,.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <div
                className="sk"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                }}
              />

              <div
                className="sk"
                style={{
                  flex: 1,
                  height: 16,
                  borderRadius: 8,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
