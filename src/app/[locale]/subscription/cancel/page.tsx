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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <CustomsLogo className="h-7 w-7" />
            <span className="text-sm font-bold tracking-tight text-foreground">
              {t("common.appName")}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 py-12 pt-4">
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
