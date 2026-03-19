import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

function detectLocaleFromHeader(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language") || "";
  // Parse Accept-Language header entries like "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7"
  const preferred = acceptLanguage
    .split(",")
    .map((entry) => {
      const [lang, q] = entry.trim().split(";q=");
      return { lang: lang.split("-")[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferred) {
    if (routing.locales.includes(lang as (typeof routing.locales)[number])) {
      return lang;
    }
  }
  return routing.defaultLocale;
}

const publicPages = ["/", "/login", "/signup"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Auto-detect locale from browser language if no cookie is set
  const hasLocaleCookie = request.cookies.has("NEXT_LOCALE");
  if (!hasLocaleCookie) {
    const detectedLocale = detectLocaleFromHeader(request);
    // Set the cookie so next-intl middleware picks it up
    request.cookies.set("NEXT_LOCALE", detectedLocale);
  }

  // Extract locale from the path
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const locale = pathnameHasLocale
    ? pathname.split("/")[1]
    : routing.defaultLocale;

  // Get the path without locale prefix
  const pathWithoutLocale = pathnameHasLocale
    ? pathname.replace(`/${locale}`, "") || "/"
    : pathname;

  // Check if this is a public page
  const isPublicPage = publicPages.includes(pathWithoutLocale);

  // Run Supabase session update
  const { supabaseResponse, user, supabase } = await updateSession(request);

  // Redirect logged-in admin users away from public pages to admin dashboard
  if (isPublicPage && user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role === "admin" && (pathWithoutLocale === "/login" || pathWithoutLocale === "/signup")) {
      const adminUrl = new URL(`/${locale}/admin`, request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  // For protected routes, check authentication
  if (!isPublicPage) {
    if (!user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check user role for route-specific access
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = userData?.role === "admin";

    // Check admin routes - only admins allowed
    if (pathWithoutLocale.startsWith("/admin")) {
      if (!isAdmin) {
        const homeUrl = new URL(`/${locale}/search`, request.url);
        return NextResponse.redirect(homeUrl);
      }
    }

    // Check if user has active subscription for /search route (skip for admins)
    if (pathWithoutLocale === "/search" && !isAdmin) {
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();

      if (!subscription) {
        const subUrl = new URL(`/${locale}/subscription`, request.url);
        return NextResponse.redirect(subUrl);
      }
    }
  }

  // Apply intl middleware for locale routing
  const response = intlMiddleware(request);

  // Copy Supabase cookies to the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, {
      ...cookie,
    });
  });

  // Persist the auto-detected locale cookie if it was just set
  if (!hasLocaleCookie) {
    const detectedLocale = detectLocaleFromHeader(request);
    response.cookies.set("NEXT_LOCALE", detectedLocale, {
      path: "/",
      maxAge: 31536000,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
