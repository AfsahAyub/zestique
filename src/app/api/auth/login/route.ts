
import { NextRequest, NextResponse } from "next/server";
import { createHmac, createHash, timingSafeEqual } from "crypto";


function safeCompare(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const username =
      typeof body === "object" && body !== null && "username" in body
        ? body.username
        : undefined;
    const password =
      typeof body === "object" && body !== null && "password" in body
        ? body.password
        : undefined;

    const correctUsername = process.env.AUTH_USERNAME;
    const correctPassword = process.env.AUTH_PASSWORD;
    const secret = process.env.AUTH_SECRET;

    if (!correctUsername || !correctPassword || !secret) {
      return NextResponse.json(
        { error: "Server authentication settings missing." },
        { status: 500 }
      );
    }

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !safeCompare(username, correctUsername) ||
      !safeCompare(password, correctPassword)
    ) {
      return NextResponse.json(
        { error: "Username ya password ghalat hai." },
        { status: 401 }
      );
    }

    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    const payload = Buffer.from(
      JSON.stringify({ expiresAt })
    ).toString("base64url");

    const signature = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const token = `${payload}.${signature}`;

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set("zestique_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Request process nahi ho saki." },
      { status: 400 }
    );
  }
}
