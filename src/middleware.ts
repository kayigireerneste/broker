import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

type Role = "client" | "agent" | "admin";

const roleToDashboard: Record<Role, string> = {
  client: "/dashboard/client",
  agent: "/dashboard/agent",
  admin: "/dashboard/admin",
};

const normalizeRole = (role?: unknown): Role | null => {
  if (typeof role !== "string") return null;
  const lower = role.toLowerCase();
  if (lower === "client" || lower === "agent" || lower === "admin") {
    return lower;
  }
  return null;
};

const extractDashboardRole = (pathname: string): Role | null => {
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "dashboard" || segments.length < 2) return null;
  return normalizeRole(segments[1]);
};

export async function middleware(request: NextRequest) {
  const tokenValue = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith("/auth");
  const openAuthPaths = new Set(["/auth/login", "/auth/signup"]);
  const isOpenAuthPage = openAuthPaths.has(pathname);
  const isDashboardPage = pathname.startsWith("/dashboard");

  const redirectToLogin = () => {
    const loginUrl = new URL("/auth/login", request.url);
    const existingRedirect = request.nextUrl.searchParams.get("redirect");

    if (existingRedirect) {
      loginUrl.searchParams.set("redirect", existingRedirect);
    } else {
      loginUrl.searchParams.set("redirect", pathname);
    }
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("token");
    return response;
  };

  if (!tokenValue) {
    if (isDashboardPage) {
      return redirectToLogin();
    }
    return NextResponse.next();
  }

  try {
    const payload = await verifyToken<{ role?: string }>(tokenValue);
    const userRole = normalizeRole(payload.role);

    if (!userRole) {
      if (isDashboardPage) {
        return redirectToLogin();
      }
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }

    if (isAuthPage && !isOpenAuthPage) {
      return NextResponse.redirect(new URL(roleToDashboard[userRole], request.url));
    }

    if (isDashboardPage) {
      const requestedRole = extractDashboardRole(pathname);
      if (!requestedRole || requestedRole !== userRole) {
        return NextResponse.redirect(new URL(roleToDashboard[userRole], request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware token verification failed:", error);
    if (isDashboardPage) {
      return redirectToLogin();
    }
    const response = NextResponse.next();
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/auth/:path*", "/dashboard/:path*"],
};