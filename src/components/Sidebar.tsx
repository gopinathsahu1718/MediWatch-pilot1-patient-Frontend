// components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import Cookies from "js-cookie";

import {
  Home,
  Activity,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from "lucide-react";

import { useState } from "react";

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Monitoring",
    href: "/monitoring",
    icon: Activity,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const pathname = usePathname();

  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  function handleLogout() {
    /*
    REMOVE TOKEN
    */

    Cookies.remove("token");

    /*
    REMOVE USER DATA
    */

    localStorage.removeItem("patient");

    /*
    REDIRECT
    */

    router.push("/login");
  }

  return (
    <>
      {/* DESKTOP SIDEBAR */}

      <aside
        className={`fixed left-0 top-0 z-50 hidden h-screen border-r border-gray-200 bg-white transition-all duration-300 md:flex flex-col ${
          collapsed ? "w-24" : "w-64"
        }`}
      >
        {/* HEADER */}

        <div className="flex h-18 items-center justify-between border-b border-gray-100 px-4">
          {/* LOGO */}

          <Link
            href="/"
            className={`flex items-center overflow-hidden transition-all duration-300 ${
              collapsed ? "w-0 opacity-0" : "w-full opacity-100"
            }`}
          >
            <img
              src="/transparentlogo.png"
              alt="MediWatch Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* TOGGLE BUTTON */}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-9 w-9 min-w-[36px] items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* NAVIGATION */}

        <nav className="flex flex-1 flex-col gap-1.5 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex h-14 items-center rounded-2xl transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
                } ${
                  active
                    ? "bg-gradient-to-r text-emerald-600 bg-emerald-100  "
                    : "text-gray-600 hover:bg-blue-50 hover:text-emerald-600"
                }`}
              >
                {/* ICON */}

                <div className="flex h-6 w-6 items-center justify-center">
                  <Icon size={20} />
                </div>

                {/* TEXT */}

                <span
                  className={`whitespace-nowrap text-[15px] font-medium transition-all duration-200 ${
                    collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* BOTTOM SECTION */}

        <div className="border-t border-gray-100 p-4">
          {/* PROFILE */}

          <Link
            href="/profile"
            className={`mb-2 flex h-12 items-center rounded-2xl transition-all duration-200 ${
              collapsed ? "justify-center px-0" : "justify-start gap-4 px-4"
            } ${
              pathname === "/profile"
                ? "bg-gradient-to-r text-emerald-600 bg-emerald-100  "
                : "text-gray-600 hover:bg-blue-50 hover:text-emerald-600"
            }`}
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <User size={22} />
            </div>

            <span
              className={`whitespace-nowrap text-[15px] font-medium transition-all duration-200 ${
                collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
              }`}
            >
              Profile
            </span>
          </Link>

          {/* LOGOUT */}

          <button
            onClick={() => setShowLogoutModal(true)}
            className={`flex h-12 w-full items-center rounded-2xl transition-all duration-200 ${
              collapsed ? "justify-center px-0" : "justify-start gap-4 px-4"
            }  text-red-600 hover:bg-red-100`}
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <LogOut size={22} />
            </div>

            <span
              className={`whitespace-nowrap text-[15px] font-medium transition-all duration-200 ${
                collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP HEADER */}

      <div className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white px-4 py-2 md:hidden">
        <div className="flex items-center justify-between">
          {/* LOGO */}

          <Link href="/">
            <img
              src="/transparentlogo.png"
              alt="MediWatch Logo"
              className="h-11 w-auto object-contain"
            />
          </Link>

          {/* PROFILE */}

          <Link
            href="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-gray-50"
          >
            <User size={18} />
          </Link>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t p-1 border-gray-100 bg-white md:hidden">
        <div className="flex h-16 items-center justify-around px-1 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex min-w-[64px] flex-col items-center justify-center gap-1"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                    active ? "bg-emerald-100 text-emerald-600" : "text-gray-500"
                  }`}
                >
                  <Icon size={20} />
                </div>

                <span
                  className={`text-[10px] font-medium leading-none ${
                    active ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* LOGOUT CONFIRMATION MODAL */}

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* HEADER */}

            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertTriangle size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Logout
                  </h3>

                  <p className="text-sm text-gray-500">Confirm logout</p>
                </div>
              </div>

              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* CONTENT */}

            <div className="mt-5">
              <p className="text-gray-600">
                Are you sure you want to logout from MediWatch?
              </p>
            </div>

            {/* ACTIONS */}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 rounded-2xl border cursor-pointer border-gray-500 py-3 font-medium text-gray-700 transition hover:shadow-xs"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleLogout();
                  setShowLogoutModal(false);
                }}
                className="flex-1 cursor-pointer rounded-2xl bg-red-500 py-3 font-medium text-white transition hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
