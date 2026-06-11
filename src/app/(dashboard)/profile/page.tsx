"use client";

import { useEffect, useState } from "react";
import {
  UserRound,
  User,
  VenusAndMars,
  Activity,
  Building2,
  UserCog,
  HeartPulse,
  Stethoscope,
  CalendarDays,
  Phone,
  Map,
  MapPin,
  LogOut,
  CalendarClock,
} from "lucide-react";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

/* ================= TYPES ================= */

type PatientProfileResponse = {
  id: string;
  readable_id: string;

  name: string;
  age: number;
  gender: string;

  phone: string;

  state: string;
  district: string;
  address_line: string;

  status: string;

  monitoring_start: string;
  monitoring_end: string;
  monitoring_days: number;

  day_number: number;

  diseaseName: string;
  departmentName: string;
  doctorName: string;

  facilityName: string;
  facilityType: string;
  facilityAddress: string;

  created_at: string;
  updated_at: string;
  last_submission_at: string;
};

type HeroInfoProps = {
  icon: React.ReactNode;
  label: string;
  value?: string | number;
  bg: string;
};

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value?: string | number;
  bg: string;
};

type SectionTitleProps = {
  title: string;
  subtitle: string;
};

type MonitorCardProps = {
  label: string;
  value?: string | number;
};

type RowProps = {
  icon: React.ReactNode;
  label: string;
  value?: string;
};

/* ================= PAGE ================= */

export default function ProfilePage() {
  const [profile, setProfile] = useState<PatientProfileResponse | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  const router = useRouter();

  async function fetchProfile() {
    try {
      setLoading(true);

      setError("");

      const data = await apiFetch<PatientProfileResponse>(
        "/api/v1/patient/profile",
      );

      setProfile(data);
    } catch (err: any) {
      console.log("profile error", err);

      switch (err.status) {
        case 404:
          setError("Profile not found");

          break;

        case 408:
          setError("Request timeout");

          break;

        case 500:
          setError("Server error");

          break;

        default:
          setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchProfile();
  }, []);

  function formatDate(dateString?: string) {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",

      month: "short",

      year: "numeric",
    });
  }

  function handleLogout(): void {
    Cookies.remove("token");

    localStorage.removeItem("patient");

    router.push("/login");
  }

  if (loading) {
    return (
      <div className="space-y-4 mx-auto px-1 md:px-20">
        {/* HERO */}
        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br  p-5">
            <div className="shimmer absolute inset-0" />

            <div className="flex justify-between items-center">
              <div className="h-7 w-44 rounded-xl bg-slate-200" />

              <div className="h-8 w-24 rounded-full bg-slate-200" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-stone-300 bg-white p-3 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-200" />

                  <div className="space-y-2">
                    <div className="h-3 w-10 rounded bg-slate-200" />

                    <div className="h-4 w-14 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CLINICAL */}
        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden">
          <div className="shimmer absolute inset-0" />

          <div className="h-5 w-36 rounded bg-slate-200" />

          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 h-10 w-10 rounded-xl bg-slate-200" />

                <div className="h-3 w-14 rounded bg-slate-200" />

                <div className="mt-2 h-4 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </section>

        {/* MONITORING */}
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="shimmer absolute inset-0" />

          <div className="h-5 w-32 rounded bg-slate-200" />

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-stone-100 bg-slate-50 p-2 text-center"
              >
                <div className="mx-auto mb-2 h-5 w-5 rounded-full bg-slate-200" />

                <div className="mx-auto h-3 w-10 rounded bg-slate-200" />

                <div className="mx-auto mt-2 h-4 w-14 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </section>

        {/* DETAILS */}
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="shimmer absolute inset-0" />

          <div className="h-5 w-36 rounded bg-slate-200" />

          <div className="mt-4 space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3"
              >
                <div className="h-10 w-10 rounded-xl bg-white" />

                <div className="space-y-2">
                  <div className="h-3 w-12 rounded bg-slate-200" />

                  <div className="h-4 w-28 rounded bg-slate-200" />
                </div>
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

  return (
    <div className="space-y-4 mx-auto px-1 md:px-20">
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-emerald-100 via-white to-cyan-50 p-5">
          <div className=" flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-between items-center  gap-2">
                <h1
                  className="
                  truncate
                  text-xl
                  font-semibold
                  text-slate-900
                  p-2
                  "
                >
                  {profile?.name}
                </h1>

                <div
                  className={`  flex items-center gap-2   rounded-full    px-3 py-1.5 ${
                    profile?.status === "active"
                      ? "bg-emerald-100"
                      : "bg-red-200"
                  }`}
                >
                  <Activity
                    size={12}
                    className={`${
                      profile?.status === "active"
                        ? "text-emerald-700"
                        : "text-red-700"
                    }`}
                  />
                  <span
                    className={`
            text-[11px]
            font-semibold
            uppercase
            ${profile?.status === "active" ? "text-emerald-700" : "text-red-700"}
                    `}
                  >
                    {profile?.status}
                  </span>
                </div>
              </div>

              <div
                className="
        mt-4
        grid grid-cols-3
        gap-2"
              >
                <HeroInfo
                  label="Age"
                  value={`
            ${profile?.age}
            `}
                  bg="bg-blue-50"
                  icon={
                    <User
                      size={14}
                      className="
                text-blue-600"
                    />
                  }
                />

                <HeroInfo
                  label="Gender"
                  value={profile?.gender.toLocaleUpperCase()}
                  bg="bg-pink-50"
                  icon={
                    <VenusAndMars
                      size={14}
                      className="
                text-pink-600"
                    />
                  }
                />

                <HeroInfo
                  label="Current Day"
                  value={profile?.day_number}
                  bg="bg-emerald-50"
                  icon={
                    <CalendarClock size={14} className="text-emerald-600" />
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-300 bg-white p-4 shadow-sm">
        <SectionTitle title="Clinical Information" subtitle="Medical details" />

        <div className=" mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <StatCard
            title="Disease Name"
            value={profile?.diseaseName}
            bg="bg-emerald-50"
            icon={<Stethoscope size={16} className="text-red-600" />}
          />

          <StatCard
            title="Department"
            value={profile?.departmentName}
            bg="bg-blue-50"
            icon={<Building2 size={16} className="text-blue-600" />}
          />

          <StatCard
            title="Doctor"
            value={profile?.doctorName}
            bg="bg-violet-50"
            icon={<UserCog size={16} className="text-violet-600" />}
          />

          <StatCard
            title="Patient ID"
            value={profile?.readable_id}
            bg="bg-cyan-50"
            icon={<UserRound size={16} className="text-cyan-600" />}
          />
        </div>
      </section>

      {/* MONITORING */}

      <section className=" rounded-[28px] border border-slate-200 bg-white  p-5  shadow-sm">
        <SectionTitle
          title="Monitoring"
          subtitle="
          Tracking duration"
        />

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
          <MonitorCard
            label="Start Date"
            value={formatDate(profile?.monitoring_start)}
          />

          <MonitorCard
            label="End Date"
            value={formatDate(profile?.monitoring_end)}
          />

          <MonitorCard
            label="Duration"
            value={`${profile?.monitoring_days} Days`}
          />
          <MonitorCard
            label="Last Submission Date"
            value={
              profile?.last_submission_at
                ? new Date(profile.last_submission_at).toLocaleString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    },
                  )
                : "N/A"
            }
          />
        </div>
      </section>

      {/* FACILITY INFORMATION*/}

      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle
          title="Facility Information"
          subtitle="Healthcare facility details"
        />

        <div className="mt-4 space-y-2">
          <Row
            label="Facility Name"
            value={profile?.facilityName}
            icon={<Building2 size={16} className="text-blue-600" />}
          />

          <Row
            label="Facility Type"
            value={profile?.facilityType}
            icon={<HeartPulse size={16} className="text-emerald-600" />}
          />

          <Row
            label="Facility Address"
            value={profile?.facilityAddress}
            icon={<MapPin size={16} className="text-rose-600" />}
          />
        </div>
      </section>

      {/* Additional */}

      <section
        className="
      rounded-[28px]
      border border-slate-200
      bg-white
      p-5
      shadow-sm"
      >
        <SectionTitle
          title="
          Additional Details"
          subtitle="
          Patient information"
        />

        <div
          className="
        mt-4
        space-y-2"
        >
          <Row
            label="Phone"
            value={profile?.phone}
            icon={<Phone size={16} className="text-blue-600" />}
          />

          <Row
            label="Address"
            value={profile?.address_line}
            icon={<MapPin size={16} className="text-rose-600" />}
          />

          <Row
            label="District"
            value={profile?.district}
            icon={<Map size={16} className="text-emerald-600" />}
          />

          <Row
            label="State"
            value={profile?.state}
            icon={<Map size={16} className="text-violet-600" />}
          />
        </div>
      </section>

      <button
        onClick={() => setShowLogoutModal(true)}
        className="
  md:hidden
  flex w-full
  items-center
  justify-center gap-2
  rounded-4xl
  bg-red-50
  py-3
  border border-red-500
  text-red-600"
      >
        <LogOut size={16} />
        Logout
      </button>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <LogOut size={24} className="text-red-600" />
            </div>

            <h3 className="text-center text-lg font-semibold text-slate-900">
              Logout
            </h3>

            <p className="mt-2 text-center text-sm text-slate-500">
              Are you sure you want to logout?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-2xl border border-slate-300 py-2.5 font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 rounded-2xl bg-red-600 py-2.5 font-medium text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= UI ================= */

function HeroInfo({ icon, label, value, bg }: HeroInfoProps) {
  return (
    <div
      className="
    rounded-xl
    bg-white  p-2
    md:p-3 flex items-center  gap-1
    border-stone-300 border"
    >
      <div
        className={`
      
      flex h-10 w-10
      items-center
      justify-center
      rounded-full
      ${bg}`}
      >
        {icon}
      </div>
      <div>
        <p
          className="
      text-[11px]
      text-slate-500"
        >
          {label}
        </p>

        <p
          className="
      mt-1
      text-sm
      font-semibold
      text-slate-900"
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, bg }: StatCardProps) {
  return (
    <div
      className="
    rounded-2xl
    bg-slate-50 border border-slate-200 p-3
    md:p-4"
    >
      <div
        className={`
      mb-3
      flex h-6 w-6 md:h-10 md:w-10
      items-center
      justify-center
      rounded-xl
      ${bg}`}
      >
        {icon}
      </div>

      <p
        className="
      text-xs
      text-slate-500"
      >
        {title}
      </p>

      <p
        className="
      mt-1
      text-sm
      font-semibold
      text-black"
      >
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ title, subtitle }: SectionTitleProps) {
  return (
    <>
      <h2
        className="
      text-sm
      font-semibold
      text-slate-900"
      >
        {title}
      </h2>

      <p
        className="
      text-xs
      text-slate-500"
      >
        {subtitle}
      </p>
    </>
  );
}

function MonitorCard({ label, value }: MonitorCardProps) {
  return (
    <div
      className="
    rounded-2xl
    bg-slate-50
    border-slate-100 border-2 p-1
    md:p-2 
    text-center text-sm md:text-xl"
    >
      <CalendarDays
        size={16}
        className="
        mx-auto mb-2
        text-blue-400"
      />

      <p
        className="
      text-xs
      text-slate-500"
      >
        {label}
      </p>

      <p
        className="
      mt-1
      text-xs md:text-sm
      font-semibold"
      >
        {value}
      </p>
    </div>
  );
}

function Row({ icon, label, value }: RowProps) {
  return (
    <div
      className="
    flex items-center gap-3
    rounded-2xl
    bg-slate-50
    p-3"
    >
      <div
        className="
      flex h-10 w-10
      items-center
      justify-center
      rounded-xl
      bg-white"
      >
        {icon}
      </div>

      <div>
        <p
          className="
        text-xs
        text-slate-500"
        >
          {label}
        </p>

        <p
          className="
        text-sm
        font-medium"
        >
          {value}
        </p>
      </div>
    </div>
  );
}
