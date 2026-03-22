import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

// Routes that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/auth/login",
  "/auth/signup",
];

const PUBLIC_PREFIXES = [
  "/api/auth/",
  "/_next/",
  "/favicon.ico",
];

function isPublic(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // For API routes, return 401 JSON instead of redirecting
  const isApiRoute = pathname.startsWith("/api/");

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  if (!session.userId) {
    if (isApiRoute) {
      return NextResponse.json({ error: "অনুমতি নেই" }, { status: 401 });
    }
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
