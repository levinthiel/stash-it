import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  getAppPin,
  verifyPin,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!getAppPin()) {
    return NextResponse.json(
      { error: "PIN not configured on server" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const pin = (body as { pin?: unknown }).pin;
  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 400 });
  }

  if (!verifyPin(pin)) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(AUTH_COOKIE_NAME, "1", authCookieOptions);
  return response;
}
