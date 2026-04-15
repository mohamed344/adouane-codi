"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/page-header";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { User, Calendar, Mail, Phone } from "lucide-react";

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
      if (!user) { router.push("/login"); return; }
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
    if (error) toast({ variant: "destructive", title: t("profile.saveError") });
    else toast({ variant: "success", title: t("profile.saved") });
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
    <PageShell maxWidth="narrow">
      <PageHeader
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
        breadcrumbs={[
          { label: t("common.home", { defaultMessage: "Home" }), href: "/search" },
          { label: t("profile.title") },
        ]}
      />

      {loading ? (
        <LoadingSkeleton variant="profile-card" />
      ) : (
        <Card variant="default" className="overflow-hidden">
          {/* Profile header */}
          <div className="bg-gradient-to-r from-[hsl(var(--primary)/0.08)] via-[hsl(var(--primary)/0.03)] to-transparent px-6 py-8 sm:px-8">
            <div className="flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent-2))] text-xl font-semibold text-white shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.45)]">
                {initials}
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                  {formData.firstName} {formData.lastName}
                </h2>
                <div className="mt-1 flex items-center gap-1.5 text-sm text-[hsl(var(--muted-fg))]">
                  <Mail className="size-3.5" />
                  {email}
                </div>
                {createdAt ? (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-[hsl(var(--muted-fg-2))]">
                    <Calendar className="size-3" />
                    {t("profile.memberSince")} {formatDate(createdAt)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="border-t border-[hsl(var(--border))]" />

          {/* Form */}
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <User className="size-5 text-[hsl(var(--primary))]" />
              <h3 className="text-base font-semibold tracking-[-0.015em] text-[hsl(var(--foreground))]">
                {t("profile.personalInfo")}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label={t("common.firstName")} htmlFor="firstName" required>
                  <Input
                    id="firstName"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </FormField>
                <FormField label={t("common.lastName")} htmlFor="lastName" required>
                  <Input
                    id="lastName"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label={t("common.email")} htmlFor="email" hint={t("profile.emailReadonly")}>
                <Input id="email" value={email} disabled />
              </FormField>

              <FormField label={t("common.phone")} htmlFor="phone">
                <Input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </FormField>

              <div className="pt-2">
                <Button type="submit" size="lg" loading={saving} disabled={saving}>
                  {t("profile.saveChanges")}
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
