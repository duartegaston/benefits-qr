import { NextResponse } from "next/server";

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { error: message, ...(code ? { code } : {}) },
    { status }
  );
}

export function apiSuccess<T>(payload: T, status = 200) {
  return NextResponse.json(payload, { status });
}
