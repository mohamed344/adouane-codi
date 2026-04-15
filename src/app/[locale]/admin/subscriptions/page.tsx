"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Search, UserX, Activity } from "lucide-react";
import { useAdmin, type Subscription } from "../context";

export default function AdminSubscriptionsPage() {
  const t = useTranslations();
  const { subscriptions, loading, fetchData } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubscriptions = subscriptions.filter((s) =>
    searchQuery
      ? s.users?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.users?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.users?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.plans?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  async function handleCancelSubscription(sub: Subscription) {
    const supabase = createClient();
    const newStatus = sub.status === "active" ? "cancelled" : "active";
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: newStatus })
      .eq("id", sub.id);
    if (error) {
      toast({ variant: "destructive", title: t("admin.subscriptionUpdateError") });
    } else {
      toast({
        variant: "success",
        title: newStatus === "cancelled" ? t("admin.subscriptionCancelled") : t("admin.subscriptionReactivated"),
      });
    }
    fetchData();
  }

  function statusVariant(status: string) {
    if (status === "active") return "default" as const;
    if (status === "cancelled") return "destructive" as const;
    return "secondary" as const;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("admin.subscriptionsManager")}</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-fg))]" />
          <Input
            placeholder={t("admin.searchSubscriptions")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colUser")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colEmail")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colPlan")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colStatus")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))] hidden md:table-cell">{t("admin.colPeriod")}</th>
                <th className="px-4 py-3 text-end font-medium text-[hsl(var(--muted-fg))]">{t("admin.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-36" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20 ms-auto" /></td>
                  </tr>
                ))
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[hsl(var(--muted-fg))]">
                    {t("admin.noSubscriptions")}
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {sub.users?.first_name} {sub.users?.last_name}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">
                      {sub.users?.email}
                    </td>
                    <td className="px-4 py-3">
                      {sub.plans?.name} — {sub.plans?.price} DA
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(sub.status)} className="text-xs">
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))] hidden md:table-cell">
                      {new Date(sub.started_at).toLocaleDateString()} → {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : "∞"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end">
                        {sub.status === "active" ? (
                          <Button variant="ghost" size="sm" onClick={() => handleCancelSubscription(sub)}>
                            <UserX className="h-4 w-4 me-1 text-destructive" />
                            {t("admin.deactivate")}
                          </Button>
                        ) : sub.status === "cancelled" ? (
                          <Button variant="ghost" size="sm" onClick={() => handleCancelSubscription(sub)}>
                            <Activity className="h-4 w-4 me-1 text-[hsl(var(--primary))]" />
                            {t("admin.reactivate")}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
