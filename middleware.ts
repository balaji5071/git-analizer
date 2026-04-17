import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PAGES = ["/sign-in", "/sign-up"];

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (AUTH_PAGES.includes(pathname) && token) {
    return redirectTo(request, "/dashboard");
  }

  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!token) {
    return redirectTo(request, "/sign-in");
  }

  if (pathname.startsWith("/dashboard/admin") && token.role !== "admin") {
    return redirectTo(request, "/unauthorized");
  }

  if (pathname.startsWith("/dashboard/recruiter") && token.role !== "recruiter") {
    return redirectTo(request, "/unauthorized");
  }

  if (
    pathname.startsWith("/dashboard/individual") &&
    token.role !== "individual"
  ) {
    return redirectTo(request, "/unauthorized");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
