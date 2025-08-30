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
      console.log("No expiration found in token");
      return true;
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = exp < now;

    console.log("Token exp:", new Date(exp * 1000));
    console.log("Current time:", new Date(now * 1000));
    console.log("Token expired:", isExpired);
    console.log("Time until expiry:", exp - now, "seconds");

    return isExpired;
  } catch (error) {
    console.error("Token decoding error:", error);
    return true;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("Middleware called for:", pathname);

  // Allow the /login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("access_token")?.value;
  console.log("Token exists:", !!token);

  if (!token || isTokenExpired(token)) {
    console.log("Redirecting to login - token missing or expired");
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  console.log("Token valid, proceeding");
  return NextResponse.next();
}

// Apply to all routes except static files and API
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|login).*)"],
};
