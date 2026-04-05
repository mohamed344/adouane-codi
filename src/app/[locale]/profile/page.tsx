"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { AppHeader } from "@/components/app-header";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { User, Calendar, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");
      setCreatedAt(user.created_at || "");
      setFormData({
        firstName: user.user_metadata?.first_name || "",
        lastName: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone || "",
      });
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      },
    });

    if (error) {
      toast({ variant: "destructive", title: t("profile.saveError") });
    } else {
      toast({ variant: "success", title: t("profile.saved") });
    }
    setSaving(false);
  }

  const initials = formData.firstName && formData.lastName
    ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
    : email ? email[0].toUpperCase() : "U";

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(
      locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-DZ" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader activeItem="profile" />

      <main className="flex-1">
        <div className="container py-8 max-w-2xl">
          <PageHeader
            title={t("profile.title")}
            subtitle={t("profile.subtitle")}
          />

          {loading ? (
            <div className="space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Card */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-lg font-semibold">
                        {formData.firstName} {formData.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{email}</p>
                      {createdAt && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {t("profile.memberSince")} {formatDate(createdAt)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="h-5 w-5 text-primary" />
                    {t("profile.personalInfo")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">{t("common.firstName")}</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">{t("common.lastName")}</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("common.email")}</Label>
                      <Input id="email" value={email} disabled className="h-11 bg-muted" />
                      <p className="text-xs text-muted-foreground">{t("profile.emailReadonly")}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("common.phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="pt-2">
                      <Button type="submit" className="rounded-lg" disabled={saving}>
                        {saving && <Loader2 className="animate-spin" />}
                        {t("profile.saveChanges")}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
