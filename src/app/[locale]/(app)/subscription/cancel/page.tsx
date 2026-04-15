"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { XCircle, ArrowLeft } from "lucide-react";

export default function SubscriptionCancelPage() {
  const t = useTranslations();
  const router = useRouter();

  return (
    <PageShell maxWidth="narrow">
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card variant="default" className="w-full max-w-md">
          <CardContent className="space-y-6 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--destructive-soft))]">
              <XCircle className="size-8 text-[hsl(var(--destructive))]" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                {t("subscription.cancelTitle")}
              </h1>
              <p className="text-sm text-[hsl(var(--muted-fg))]">
                {t("subscription.cancelSubtitle")}
              </p>
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <Button size="lg" className="w-full" onClick={() => router.push("/subscription")}>
                <ArrowLeft className="size-4 rtl:rotate-180" />
                {t("subscription.tryAgain")}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => router.push("/")}>
                {t("subscription.backToHome")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
