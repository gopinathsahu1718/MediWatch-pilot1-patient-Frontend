import Cookies from "js-cookie";

export const BASE_URL =
  "https://api.mediwatch.in";

const DEFAULT_TIMEOUT = 30000;
const UPLOAD_TIMEOUT = 180000;

let authRedirecting = false;

/* ================= TYPES ================= */

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(
    message: string,
    status: number,
    data?: any,
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
    "patient",
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
      current,
    )}`;
}

/* ================= API ================= */

export async function apiFetch<
  T = any,
>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    Cookies.get("token");

  const controller =
    new AbortController();

  const isFormData =
    typeof FormData !==
      "undefined" &&
    options.body instanceof
      FormData;

  const timeout =
    isFormData
      ? UPLOAD_TIMEOUT
      : DEFAULT_TIMEOUT;

  const timeoutId =
    setTimeout(
      () =>
        controller.abort(),
      timeout,
    );

  try {
    console.log(
      "[API REQUEST]",
      options.method || "GET",
      endpoint,
    );

    if (isFormData) {
      console.log(
        "[UPLOAD REQUEST]",
        endpoint,
      );

      const body =
        options.body as FormData;

      for (const [
        key,
        value,
      ] of body.entries()) {
        console.log(
          "[FORMDATA]",
          key,
          value,
        );
      }
    }

    const response =
      await fetch(
        `${BASE_URL}${endpoint}`,
        {
          ...options,

          signal:
            controller.signal,

          mode: "cors",

          headers: {
            ...(options.body &&
            !isFormData
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),

            ...(options.headers ||
              {}),
          },
        },
      );

    clearTimeout(
      timeoutId,
    );

    console.log(
      "[API RESPONSE]",
      response.status,
      endpoint,
    );

    let res:
      | ApiResponse<T>
      | any
      | null = null;

    const contentType =
      response.headers.get(
        "content-type",
      );

    /* Special upload size error */

    if (
      response.status ===
      413
    ) {
      throw new ApiError(
        "Uploaded image size is too large.",
        413,
      );
    }

    /* Parse JSON if available */

    if (
      contentType?.includes(
        "application/json",
      )
    ) {
      try {
        res =
          await response.json();
      } catch {
        throw new ApiError(
          "Invalid server response.",
          500,
        );
      }
    }

    /* GLOBAL AUTH */

    if (
      response.status ===
      401
    ) {
      redirectLogin();

      throw new ApiError(
        "Session expired. Please login again.",
        401,
        res,
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
        res,
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
        res,
      );
    }

    return (
      res?.data ?? null
    ) as T;
  } catch (err: any) {
    clearTimeout(
      timeoutId,
    );

    console.error(
      "[API ERROR]",
      endpoint,
      err,
    );

    /* TIMEOUT */

    if (
      err?.name ===
      "AbortError"
    ) {
      throw new ApiError(
        isFormData
          ? "Image upload is taking too long. Please try again."
          : "Request timeout. Please try again.",
        408,
      );
    }

    /* OUR OWN ERRORS */

    if (
      err instanceof
      ApiError
    ) {
      throw err;
    }

    /* FETCH ERRORS */

    if (
      err instanceof
      TypeError
    ) {
      throw new ApiError(
        navigator.onLine
          ? "Unable to connect to the server. Please try again."
          : "No internet connection.",
        0,
      );
    }

    /* FALLBACK */

    throw new ApiError(
      err?.message ||
        "Unexpected error occurred.",
      500,
    );
  }
}