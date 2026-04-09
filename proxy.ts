import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login"];
const PUBLIC_PREFIXES = ["/auth/confirm"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname) || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const { response, user } = await updateSession(request);

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
