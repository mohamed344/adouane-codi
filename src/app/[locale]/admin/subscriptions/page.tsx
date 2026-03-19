"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { CreditCard, FileText, Calendar, Mail, Search, UserX, Activity } from "lucide-react";
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

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("admin.subscriptionsManager")}</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("admin.searchSubscriptions")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg border p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t("admin.noSubscriptions")}</p>
          ) : (
            <div className="space-y-3">
              {filteredSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full shrink-0 ${
                    sub.status === "active" ? "bg-green-500/10 text-green-500" :
                    sub.status === "cancelled" ? "bg-red-500/10 text-red-500" :
                    "bg-gray-500/10 text-gray-500"
                  }`}>
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{sub.users?.first_name} {sub.users?.last_name}</p>
                      <Badge
                        variant={sub.status === "active" ? "default" : sub.status === "cancelled" ? "destructive" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {sub.users?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {sub.plans?.name} - ${sub.plans?.price}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(sub.started_at).toLocaleDateString()} → {new Date(sub.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {sub.status === "active" ? (
                      <Button variant="destructive" size="sm" onClick={() => handleCancelSubscription(sub)}>
                        <UserX className="h-4 w-4 mr-1" />
                        {t("admin.deactivate")}
                      </Button>
                    ) : sub.status === "cancelled" ? (
                      <Button variant="outline" size="sm" onClick={() => handleCancelSubscription(sub)}>
                        <Activity className="h-4 w-4 mr-1" />
                        {t("admin.reactivate")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
