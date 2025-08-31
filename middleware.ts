import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to decode JWT
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const exp = payload.exp;
    if (!exp) {
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = exp < now;

    return isExpired;
  } catch (error) {
    console.error("Token decoding error:", error);
    return true;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow the /login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;

  if (!token || isTokenExpired(token)) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply to all routes except static files and API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"],
};
