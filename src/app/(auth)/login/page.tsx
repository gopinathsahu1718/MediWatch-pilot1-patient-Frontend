"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { BASE_URL } from "@/lib/api";
import HealthcareOnboarding from "@/components/HealthcareOnboarding";

type Step = "phone" | "otp" | "onboarding";

export default function OTPLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCount, setResendCount] = useState(0);

  const [sendingOTP, setSendingOTP] = useState(false);
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);

  const MAX_RESENDS = 5;

  const OTP_EXPIRY = 600;

  const [timer, setTimer] = useState(OTP_EXPIRY);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  /*
  ==========================================
  TIMER
  ==========================================
  */

  useEffect(() => {
    if (step !== "otp" || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, step]);

  /*
  ==========================================
  ENABLE RESEND
  ==========================================
  */

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
    }
  }, [timer]);

  /*
  ==========================================
  AUTO FOCUS OTP
  ==========================================
  */

  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  /*
  ==========================================
  AUTO HIDE ERROR
  ==========================================
  */

  useEffect(() => {
    if (!error) return;

    const timeout = setTimeout(() => {
      setError("");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    if (!success) return;

    const timeout = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [success]);

  /*
  ==========================================
  FORMAT TIMER
  ==========================================
  */

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;

    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  /*
  ==========================================
  PHONE VALIDATION
  ==========================================
  */

  function validatePhone(value: string) {
    return /^[6-9]\d{9}$/.test(value);
  }

  /*
  ==========================================
  SEND OTP
  ==========================================
  */

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();

    if (phone.length !== 10) return;

    setError("");

    if (!validatePhone(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }

    try {
      setSendingOTP(true);

      const response = await fetch(`${BASE_URL}/api/v1/auth/send-otp`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to send OTP");
        return;
      }
      setStep("otp");
      setTimer(OTP_EXPIRY);
      setCanResend(false);
      setResendCount(0);
      setSuccess(`OTP sent successfully`);
    } catch {
      setError("Unable to send OTP");
    } finally {
      setSendingOTP(false);
    }
  }

  /*
  ==========================================
  OTP INPUT CHANGE
  ==========================================
  */

  function handleOTPChange(value: string, index: number) {
    if (!/^\d*$/.test(value)) return;

    const updated = [...otp];

    updated[index] = value.slice(-1);

    setOtp(updated);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  /*
  ==========================================
  BACKSPACE NAVIGATION
  ==========================================
  */

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  /*
  ==========================================
  OTP PASTE
  ==========================================
  */

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();

    const pasted = e.clipboardData.getData("text").trim();

    if (!/^\d{6}$/.test(pasted)) return;

    setOtp(pasted.split(""));

    otpRefs.current[5]?.focus();
  }

  /*
  ==========================================
  VERIFY OTP
  ==========================================
  */

  async function handleVerifyOTP() {
    const finalOTP = otp.join("");

    if (finalOTP.length !== 6 || verifyingOTP) return;

    setError("");

    if (timer === 0) {
      setError("OTP expired");
      return;
    }

    try {
      setVerifyingOTP(true);

      const response = await fetch(`${BASE_URL}/api/v1/auth/verify-otp`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone,
          otp: finalOTP,
        }),
      });

      const res = await response.json();

      if (!response.ok) {
        setError(res.message || "Invalid OTP");
        return;
      }

      console.log(res);
      /*
      ==========================================
      STORE TOKEN COOKIE
      ==========================================
      */

      Cookies.set("token", res.data.token, {
        expires: 30,
      });

      /*
      ==========================================
      STORE PATIENT
      ==========================================
      */

      localStorage.setItem("patient", JSON.stringify(res.data.patient));

      /*
      ==========================================
      REDIRECT
      ==========================================
      */
      setStep("onboarding");
    } catch {
      setError("Invalid OTP");
    } finally {
      setVerifyingOTP(false);
    }
  }

  /*
  ==========================================
  RESEND OTP
  ==========================================
  */

  async function handleResendOTP() {
    if (!canResend || resendingOTP) return;

    if (resendCount >= MAX_RESENDS) {
      setError("Maximum resend attempts reached");
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResendingOTP(true);

      const response = await fetch(`${BASE_URL}/api/v1/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
        }),
      });

      const res = await response.json();

      if (!response.ok) {
        setError(res.message || "Unable to resend OTP");
        return;
      }

      setOtp(["", "", "", "", "", ""]);

      setTimer(OTP_EXPIRY);

      setCanResend(false);

      setResendCount((prev) => prev + 1);

      setSuccess(`OTP sent successfully`);

      otpRefs.current[0]?.focus();
    } catch {
      setError("Unable to resend OTP");
    } finally {
      setResendingOTP(false);
    }
  }

  /*
  ==========================================
  STATES
  ==========================================
  */

  const isOTPComplete = otp.join("").length === 6;

  /*
  ==========================================
  STYLES
  ==========================================
  */

  const primaryBtn =
    "w-full min-h-[50px] sm:min-h-[56px] px-4 py-3 rounded-2xl bg-gradient-to-r  from-emerald-600 to-blue-600 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200";

  const secondaryBtn =
    "w-full min-h-[48px] sm:min-h-[52px] px-4 py-3 rounded-2xl border border-slate-300 bg-white text-slate-800 font-medium flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200";

  const inputStyle =
    "w-full min-h-[54px] rounded-2xl border border-slate-300 bg-slate-50 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-slate-900";

  return (
    <div>
      {step === "phone" || step === "otp" ? 
        <div className="min-h-svh bg-gradient-to-br from-[#081225] to-[#1c3f94] flex items-center justify-center p-5 sm:p-8">
      
        <div className="w-full max-w-md flex flex-col">
        {/* LOGO */}

        <div className="flex justify-center mb-2 sm:mb-4">
          <img
            src="/imageLogo.png"
            alt="MediWatch Logo"
            className="w-[150px] sm:w-[200px] md:w-[240px] h-auto object-contain"
          />
        </div>

        {/* CARD */}

        <div className="bg-white rounded-[24px] sm:rounded-[30px] shadow-2xl overflow-hidden  w-full ">
          {/* PHONE STEP */}

          {step === "phone" && (
            <form onSubmit={handleSendOTP} className="p-6 sm:p-8">
              <div className="text-center mb-7">
                <h1 className="text-3xl font-bold text-slate-900">Welcome</h1>

                <p className="text-slate-600 mt-2">
                  Sign in with OTP verification
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5 animate-in fade-in">
                  {error}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-slate-800">
                  Mobile Number
                </label>

                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 font-semibold">
                    +91
                  </div>

                  <input
                    type="tel"
                    value={phone}
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="9876543210"
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className={`${inputStyle} pl-16 pr-4`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={sendingOTP || phone.length !== 10}
                className={primaryBtn}
              >
                {sendingOTP ? "Sending OTP..." : "Continue"}
              </button>
            </form>
          )}

          {/* OTP STEP */}

          {step === "otp" && (
            <div className="p-5 sm:p-8">
              <button
                onClick={() => {
                  setStep("phone");

                  setOtp(["", "", "", "", "", ""]);

                  setError("");
                }}
                className="text-sm font-semibold text-slate-700  hover:text-black transition"
              >
                ← Back
              </button>

              <div className="text-center mb-4">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">
                  Verify OTP
                </h1>

                <p className="text-slate-500 text-sm mt-3">
                  Code sent to
                  <span className="font-semibold text-slate-800">
                    {" "}
                    +91 {phone}
                  </span>
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-2xl px-4 py-3 mb-5">
                  {success}
                </div>
              )}

              {/* OTP INPUTS */}

              <div className="flex justify-between gap-2 sm:gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    onChange={(e) => handleOTPChange(e.target.value, i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    onPaste={handlePaste}
                    className={`w-10 h-12 sm:w-12 sm:h-16 rounded-xl border text-center text-base sm:text-xl font-bold outline-none transition-all duration-200
                    ${
                      digit
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-300 bg-slate-50"
                    }
                    focus:ring-4 focus:ring-blue-100 focus:border-blue-500`}
                  />
                ))}
              </div>

              {/* TIMER */}

              <p className="text-center text-sm text-slate-700 mb-6">
                {timer > 0 ? (
                  <>
                    OTP expires in
                    <span className="font-semibold text-blue-600 ml-1">
                      {formatTime(timer)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-500 font-medium">OTP expired</span>
                )}
              </p>

              {/* VERIFY BUTTON */}

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={verifyingOTP || !isOTPComplete}
                className={`${primaryBtn} mb-3`}
              >
                {verifyingOTP ? "Verifying..." : "Verify OTP"}
              </button>

              {/* RESEND BUTTON */}

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || resendingOTP}
                className={secondaryBtn}
              >
                {resendingOTP
                  ? "Sending..."
                  : canResend
                    ? "Resend OTP"
                    : `Resend in ${formatTime(timer)}`}
              </button>
            </div>
          )}
        </div>
      </div> 
      
      </div>: <></>}
      

      {/* Onboarding */}
      {step === "onboarding" && (
        <HealthcareOnboarding onFinish={() => router.push("/")} />
      )}
    </div>
  );
}
