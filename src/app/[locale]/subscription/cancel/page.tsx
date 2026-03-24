"use client";

import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { CustomsLogo } from "@/components/customs-logo";
import { XCircle, ArrowLeft } from "lucide-react";

export default function SubscriptionCancelPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/[0.03] via-transparent to-primary/[0.06]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-destructive/[0.04] rounded-full blur-3xl" />
      </div>

      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl">
        <div className="glass-nav rounded-full shadow-lg shadow-black/5">
          <div className="flex h-12 items-center justify-between px-5">
            <Link href="/" className="flex items-center gap-2 group">
              <CustomsLogo className="h-7 w-7 transition-transform duration-300 group-hover:scale-105" />
              <span className="text-sm font-bold tracking-tight text-foreground">
                {t("common.appName")}
              </span>
            </Link>
            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 py-12 pt-24">
        <Card className="w-full max-w-md border-border/50 shadow-xl shadow-black/[0.04]">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {t("subscription.cancelTitle")}
              </h1>
              <p className="text-muted-foreground">
                {t("subscription.cancelSubtitle")}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                className="w-full h-11"
                onClick={() => router.push("/subscription")}
              >
                <ArrowLeft className="h-4 w-4" />
                {t("subscription.tryAgain")}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => router.push("/")}
              >
                {t("subscription.backToHome")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
