import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { token, userId } = body;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  // Set the cookie for this frontend domain with cross-domain support
  // Using sameSite: "none" and secure: true for cross-domain cookie sharing
  const isProduction = process.env.NODE_ENV === "production";
  
  // Set token cookie
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    // Optionally set domain for better cookie sharing on subdomains
    ...(isProduction && { domain: ".vercel.app" }),
  });

  // Set userId cookie (non-httpOnly so it can be read by client-side code)
  if (userId) {
    response.cookies.set("userId", userId, {
      httpOnly: false, // Allow client-side access
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      ...(isProduction && { domain: ".vercel.app" }),
    });
  }

  return response;
}

