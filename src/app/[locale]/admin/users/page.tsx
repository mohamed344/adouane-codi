"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Trash2, Search, Loader2, CreditCard } from "lucide-react";
import { useAdmin, type UserRow } from "../context";

type Duration = "custom" | "yearly" | "lifetime";

export default function AdminUsersPage() {
  const t = useTranslations();
  const { users, plans, loading, fetchData } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [disablingUser, setDisablingUser] = useState(false);

  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [grantUser, setGrantUser] = useState<UserRow | null>(null);
  const [grantPlanId, setGrantPlanId] = useState("");
  const [grantDuration, setGrantDuration] = useState<Duration>("custom");
  const [customMonths, setCustomMonths] = useState(1);
  const [granting, setGranting] = useState(false);

  const paidPlans = plans.filter((p) => p.price > 0);

  const filteredUsers = users.filter((u) =>
    searchQuery
      ? u.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  async function handleDeleteUser() {
    if (!deletingUser) return;
    setDisablingUser(true);
    const supabase = createClient();
    const { error } = await supabase.from("users").delete().eq("id", deletingUser.id);
    setDisablingUser(false);
    if (error) {
      toast({ variant: "destructive", title: t("admin.userDeleteError") });
    } else {
      toast({ variant: "success", title: t("admin.userDeleted") });
    }
    setDeleteUserDialogOpen(false);
    setDeletingUser(null);
    fetchData();
  }

  function openGrantDialog(user: UserRow) {
    setGrantUser(user);
    setGrantPlanId(paidPlans[0]?.id || "");
    setGrantDuration("custom");
    setCustomMonths(1);
    setGrantDialogOpen(true);
  }

  async function handleGrantSubscription() {
    if (!grantUser || !grantPlanId) return;
    setGranting(true);
    const supabase = createClient();

    const now = new Date();
    let expiresAt: string | null = null;
    if (grantDuration === "custom") {
      expiresAt = new Date(now.getTime() + customMonths * 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (grantDuration === "yearly") {
      expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    }

    const { error } = await supabase.from("subscriptions").insert({
      user_id: grantUser.id,
      plan_id: grantPlanId,
      status: "active",
      payment_id: `admin_grant_${Date.now()}`,
      started_at: now.toISOString(),
      expires_at: expiresAt,
    });

    setGranting(false);
    if (error) {
      toast({ variant: "destructive", title: t("admin.subscriptionGrantError") });
    } else {
      toast({ variant: "success", title: t("admin.subscriptionGranted") });
    }
    setGrantDialogOpen(false);
    setGrantUser(null);
    fetchData();
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("admin.usersManager")}</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-fg))]" />
          <Input
            placeholder={t("admin.searchUsers")}
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
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colName")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colEmail")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))] hidden md:table-cell">{t("admin.colPhone")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colRole")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))] hidden sm:table-cell">{t("admin.colJoined")}</th>
                <th className="px-4 py-3 text-end font-medium text-[hsl(var(--muted-fg))]">{t("admin.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                    <td className="px-4 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ms-auto" /></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-[hsl(var(--muted-fg))]">
                    {t("admin.noUsers")}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    <td className="px-4 py-3 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))] hidden md:table-cell">
                      {user.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                        {user.role === "admin" ? t("admin.adminRole") : t("admin.userRole")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))] hidden sm:table-cell">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openGrantDialog(user)}
                          title={t("admin.grantSubscription")}
                        >
                          <CreditCard className="h-4 w-4 text-[hsl(var(--primary))]" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingUser(user);
                            setDeleteUserDialogOpen(true);
                          }}
                          title={t("admin.deleteUser")}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteUserDialogOpen} onOpenChange={setDeleteUserDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.deleteUser")}</DialogTitle>
            <DialogDescription>
              {t("admin.confirmDeleteUser", { name: `${deletingUser?.first_name} ${deletingUser?.last_name}` })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUserDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={disablingUser}>
              {disablingUser && <Loader2 className="animate-spin" />}
              {t("common.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Subscription Dialog */}
      <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.grantSubscription")}</DialogTitle>
            <DialogDescription>
              {t("admin.grantSubscriptionDesc", { name: `${grantUser?.first_name} ${grantUser?.last_name}` })}
            </DialogDescription>
          </DialogHeader>

          {paidPlans.length === 0 ? (
            <p className="text-sm text-[hsl(var(--muted-fg))] py-4">{t("admin.noPlansAvailable")}</p>
          ) : (
            <div className="space-y-4 py-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("admin.selectPlan")}</label>
                <select
                  value={grantPlanId}
                  onChange={(e) => setGrantPlanId(e.target.value)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                >
                  {paidPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} — {plan.price} DA
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">{t("admin.selectDuration")}</label>
                <select
                  value={grantDuration}
                  onChange={(e) => setGrantDuration(e.target.value as Duration)}
                  className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                >
                  <option value="custom">{t("admin.durationCustomMonths")}</option>
                  <option value="yearly">{t("admin.durationYearly")}</option>
                  <option value="lifetime">{t("admin.durationLifetime")}</option>
                </select>
              </div>

              {grantDuration === "custom" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{t("admin.numberOfMonths")}</label>
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    value={customMonths}
                    onChange={(e) => setCustomMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setGrantDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleGrantSubscription} disabled={granting || !grantPlanId}>
              {granting && <Loader2 className="animate-spin" />}
              {t("admin.grant")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
