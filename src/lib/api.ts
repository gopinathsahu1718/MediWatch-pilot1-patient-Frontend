import Cookies from "js-cookie";

export const BASE_URL =
  "https://api.mediwatch.in";

const REQUEST_TIMEOUT =
  60000;

let authRedirecting = false;

/* ================= TYPES ================= */

export class ApiError extends Error {

  status: number;

  data?: any;

  constructor(
    message: string,
    status: number,
    data?: any
  ) {
    super(message);

    this.name = "ApiError";

    this.status = status;

    this.data = data;
  }
}

type ApiResponse<T> = {
  success: boolean;

  statusCode: number;

  message: string;

  data: T;
};

/* ================= HELPERS ================= */

function clearAuth() {

  Cookies.remove("token");

  localStorage.removeItem(
    "patient"
  );
}

function redirectLogin() {

  if (authRedirecting) return;

  authRedirecting = true;

  clearAuth();

  const current =
    window.location.pathname;

  window.location.href =
    `/login?expired=true&redirect=${encodeURIComponent(
      current
    )}`;
}

/* ================= API ================= */

export async function apiFetch<
  T = any
>(
  endpoint: string,

  options: RequestInit = {}
): Promise<T> {

  const token =
    Cookies.get("token");

  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () =>
        controller.abort(),

      REQUEST_TIMEOUT
    );

  try {

    const response =
      await fetch(
        `${BASE_URL}${endpoint}`,
        {
          ...options,

          signal:
            controller.signal,

          headers: {

            ...(options.body &&
              !(options.body instanceof FormData)
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),

            ...(token && {
              Authorization:
                `Bearer ${token}`,
            }),

            ...(options.headers ||
              {}),
          },
        }
      );

    clearTimeout(
      timeoutId
    );

    let res:
      | ApiResponse<T>
      | any
      | null = null;

    const contentType =
      response.headers.get(
        "content-type"
      );

    if (
      contentType?.includes(
        "application/json"
      )
    ) {
      try {

        res =
          await response.json();

      } catch {

        throw new ApiError(
          "Invalid server response",
          500
        );
      }
    }

    /* GLOBAL AUTH */

    if (
      response.status === 401
    ) {

      redirectLogin();

      throw new ApiError(
        "Session expired",
        401,
        res
      );
    }

    /* HTTP FAIL */

    if (
      !response.ok
    ) {

      throw new ApiError(

        res?.message ||

        `Request failed (${response.status})`,

        response.status,

        res
      );
    }

    /* LOGICAL FAIL */

    if (
      res?.success === false
    ) {

      throw new ApiError(

        res.message ||

        "Request failed",

        res.statusCode ||
          400,

        res
      );
    }

    return (
      res?.data ??
      null
    ) as T;

  } catch (err: any) {

    clearTimeout(
      timeoutId
    );

    if (
      err.name ===
      "AbortError"
    ) {

      throw new ApiError(
        "Request timeout",
        408
      );
    }

    if (
      err instanceof
      TypeError
    ) {

      throw new ApiError(
        "Check your internet connection",
        0
      );
    }

    if (
      err instanceof
      ApiError
    ) {

      throw err;
    }

    throw new ApiError(

      err?.message ||

      "Unexpected error",

      500
    );
  }
}