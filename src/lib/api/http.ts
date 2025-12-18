import { NextResponse } from "next/server";

export type APIErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export function apiError(status: number, code: string, message: string, details?: unknown) {
  const body: APIErrorResponse = { error: { code, message, ...(details ? { details } : {}) } };
  return NextResponse.json(body, { status });
}

