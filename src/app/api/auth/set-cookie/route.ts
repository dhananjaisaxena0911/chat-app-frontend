import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { token, userId } = body;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

  // Set the cookie for this frontend domain
  // Using sameSite: "lax" works properly with Next.js router.refresh()
  const isProduction = process.env.NODE_ENV === "production";
  
  // Set token cookie
  response.cookies.set("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  // Set userId cookie (non-httpOnly so it can be read by client-side code)
  if (userId) {
    response.cookies.set("userId", userId, {
      httpOnly: false, // Allow client-side access
      secure: isProduction,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
  }

  return response;
}

