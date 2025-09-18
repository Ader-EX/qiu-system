import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export function middleware(req: NextRequest) {
    const {pathname} = req.nextUrl;

    const publicRoutes = ['/login'];
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }


    const token = req.cookies.get("access_token")?.value;

    if (!token) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/login";
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};