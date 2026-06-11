"use client";

import { useState } from "react";
import {
  Activity,
  ShieldAlert,
  Users,
  ChevronRight,
  ChevronLeft,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  CheckCircle2,
} from "lucide-react";

type Props = {
  onFinish: () => void;
};

const slides = [
  {
    icon: Activity,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Daily Health Check",
    description:
      "Complete a short daily health check. Your responses help your care team monitor your condition and identify concerns early.",
  },
  {
    icon: ShieldAlert,
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    title: "Emergency Notice",
    description:
      "This platform supports monitoring and follow-ups. For severe symptoms or emergencies, contact your doctor or emergency services immediately.",
  },
  {
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    title: "Monitoring Support",
    description:
      "If a daily check-in is missed, our monitoring team may contact you to ensure you receive timely support.",
  },
];

export default function HealthcareOnboarding({ onFinish }: Props) {
  const [current, setCurrent] = useState(0);

  const slide = slides[current];
  const Icon = slide.icon;

  const next = () => {
    if (current < slides.length - 1) {
      setCurrent((prev) => prev + 1);
    }
  };

  const prev = () => {
    if (current > 0) {
      setCurrent((prev) => prev - 1);
    }
  };

  return (
    <div className=" sm:min-h-screen overflow-hidden bg-gradient-to-br from-emerald-100 via-white to-emerald-50">
      {/* Background Decorations */}

      <div className="hidden lg:flex pointer-events-none fixed inset-0 overflow-hidden">
        <HeartPulse
          size={220}
          className="absolute -left-16 top-10 text-emerald-100 opacity-40 blur-[1px]"
        />

       

        <Stethoscope
          size={260}
          className="absolute bottom-0 -right-20 text-slate-100 opacity-70"
        />

        <Activity
          size={180}
          className="absolute bottom-24 left-0 text-emerald-100 opacity-40"
        />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="mx-auto flex min-h-90vh sm:min-h-svh max-w-6xl items-center px-4 py-6 sm:px-6 lg:px-10">
          <div className="grid w-full items-center gap-15 lg:grid-cols-[1.15fr_0.85fr]">
            {/* LEFT SIDE - DESKTOP */}

            <div className="hidden lg:flex flex-col justify-center">
              <img
                src="/transparentlogo.png"
                alt="MediWatch"
                className="w-[240px] object-contain"
              />

              <div className="mt-8 max-w-xl">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                  Smart Remote
                  <span className="block bg-gradient-to-r from-emerald-600 pb-2 to-blue-500 bg-clip-text text-transparent">
                    Patient Monitoring
                  </span>
                </h1>

                <p className="mt-2 text-base leading-7 text-slate-600">
                  Stay connected with your care team through daily monitoring,
                  early risk detection, and continuous healthcare support.
                </p>
              </div>

              <div className="mt-10 grid gap-4">
                {[
                  "Daily health monitoring",
                  "Early risk detection",
                  "Secure patient tracking",
                  "Continuous care support",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white/70 px-4 py-4 backdrop-blur-sm shadow-sm"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600 flex-shrink-0"
                    />

                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="mx-auto  w-full max-w-md lg:max-w-lg">
              {/* MOBILE LOGO */}

              <div className="mb-6 flex justify-center lg:hidden">
                <img
                  src="/transparentlogo.png"
                  alt="MediWatch"
                  className="w-[170px] object-contain"
                />
              </div>

              <div
                className="
                  rounded-[28px]
                  border
                  border-stone-400
                  bg-white/90
                  backdrop-blur-xl
                  shadow-[0_20px_60px_rgba(0,0,0,0.08)]
                  overflow-hidden
                "
              >
                {/* HEADER */}

                <div className="border-b border-slate-100 px-5 py-4 sm:px-7">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Getting Started
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        Step {current + 1} of {slides.length}
                      </p>
                    </div>

                    <button
                      onClick={onFinish}
                      className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
                    >
                      Skip
                    </button>
                  </div>

                  {/* Progress */}

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-slate-300
                       
                        transition-all
                        duration-500
                      "
                      style={{
                        width: `${((current + 1) / slides.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* CONTENT */}

                <div className="px-5 py-8 sm:px-8 sm:py-6">
                  <div className="flex justify-center">
                    <div
                      className={`
                        flex items-center justify-center
                        rounded-3xl
                        ${slide.iconBg}
                        h-16 w-16
                        sm:h-20 sm:w-20
                      `}
                    >
                      <Icon
                        size={32}
                        className={slide.iconColor}
                        strokeWidth={2}
                      />
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      {slide.title}
                    </h2>

                    <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-[15px]">
                      {slide.description}
                    </p>
                  </div>

                  {/* Mobile Benefit Card */}

                  
                </div>

                {/* FOOTER */}

                <div className="border-t border-slate-100 px-5 py-4 sm:px-7 mb-3 md:mb-5">
                  {current === slides.length - 1 ? (
                    <button
                      onClick={onFinish}
                      className="
                        w-full
                        h-12
                        rounded-xl
                        bg-gradient-to-r
                        from-emerald-500
                        to-blue-600
                        text-white
                        text-sm
                        font-semibold
                        shadow-lg
                        
                        transition-all
                        cursor-pointer
                      "
                    >
                      Welcome to Dashboard
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      {current > 0 && (
                        <button
                          onClick={prev}
                          className="
                            h-12
                            w-12
                            flex-shrink-0
                            rounded-xl
                            border
                            border-slate-300
                            bg-white
                            flex
                            items-center
                            justify-center
                            transition
                            hover:bg-slate-50
                            cursor-pointer
                          "
                        >
                          <ChevronLeft size={18} />
                        </button>
                      )}

                      <button
                        onClick={next}
                        className="
                          flex-1
                          h-12
                          rounded-xl
                          bg-gradient-to-r
                          from-emerald-500
                          to-blue-500
                          text-white
                          text-sm
                          font-semibold
                          flex
                          items-center
                          justify-center
                          gap-2
                          transition-all
                          cursor-pointer
                        "
                      >
                        Next
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* MOBILE STEP INDICATORS */}

              <div className="mt-5 flex justify-center gap-2 lg:hidden">
                {slides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      current === index
                        ? "w-8 bg-emerald-400"
                        : "w-2 bg-slate-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
