import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  /*
  ======================================
  TOKEN
  ======================================
  */

  const token = request.cookies.get("token")?.value;

  /*
  ======================================
  CURRENT PATH
  ======================================
  */

  const path = request.nextUrl.pathname;

  /*
  ======================================
  AUTH PAGES
  ======================================
  */

  const isAuthPage = path === "/login";

  /*
  ======================================
  USER NOT LOGGED IN
  ======================================
  */

  if (!token && !isAuthPage) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  /*
  ======================================
  USER ALREADY LOGGED IN
  ======================================
  */

  if (token && isAuthPage) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return NextResponse.next();
}

/*
======================================
ROUTES TO PROTECT
======================================
*/

export const config = {
  matcher: [
    "/",
    "/monitoring",
    "/history",
    "/profile",
    "/login",
  ],
};