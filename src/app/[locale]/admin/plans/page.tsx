"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAdmin, type Plan } from "../context";

const emptyPlan = {
  name: "",
  description: "",
  price: 0,
  billing_cycle: "monthly",
  features: "",
  is_active: true,
  is_popular: false,
};

export default function AdminPlansPage() {
  const t = useTranslations();
  const { plans, loading, fetchData } = useAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState(emptyPlan);
  const [saving, setSaving] = useState(false);

  function openCreateDialog() {
    setEditingPlan(null);
    setFormData(emptyPlan);
    setDialogOpen(true);
  }

  function openEditDialog(plan: Plan) {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      billing_cycle: plan.billing_cycle,
      features: plan.features?.join("\n") || "",
      is_active: plan.is_active,
      is_popular: plan.is_popular || false,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const planData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      billing_cycle: formData.billing_cycle,
      features: formData.features.split("\n").filter((f) => f.trim()),
      is_active: formData.is_active,
      is_popular: formData.is_popular,
    };

    if (editingPlan) {
      await supabase.from("plans").update(planData).eq("id", editingPlan.id);
      toast({ variant: "success", title: t("admin.planUpdated") });
    } else {
      await supabase.from("plans").insert(planData);
      toast({ variant: "success", title: t("admin.planCreated") });
    }

    setSaving(false);
    setDialogOpen(false);
    fetchData();
  }

  async function handleDelete() {
    if (!deletingPlan) return;
    const supabase = createClient();
    await supabase.from("plans").delete().eq("id", deletingPlan.id);
    setDeleteDialogOpen(false);
    setDeletingPlan(null);
    toast({ variant: "success", title: t("admin.planDeleted") });
    fetchData();
  }

  async function handleToggleActive(plan: Plan) {
    const supabase = createClient();
    await supabase
      .from("plans")
      .update({ is_active: !plan.is_active })
      .eq("id", plan.id);
    fetchData();
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t("admin.plansManager")}</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4" />
          {t("admin.addPlan")}
        </Button>
      </div>

      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.4)]">
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colName")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))] hidden md:table-cell">{t("admin.planDescription")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colPrice")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))]">{t("admin.colBilling")}</th>
                <th className="px-4 py-3 text-start font-medium text-[hsl(var(--muted-fg))] hidden lg:table-cell">{t("admin.colFeatures")}</th>
                <th className="px-4 py-3 text-center font-medium text-[hsl(var(--muted-fg))]">{t("admin.colActive")}</th>
                <th className="px-4 py-3 text-end font-medium text-[hsl(var(--muted-fg))]">{t("admin.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-[hsl(var(--border))]">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-3 hidden md:table-cell"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="px-4 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-5 w-10 mx-auto rounded-full" /></td>
                    <td className="px-4 py-3"><Skeleton className="h-4 w-16 ms-auto" /></td>
                  </tr>
                ))
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[hsl(var(--muted-fg))]">
                    {t("admin.noPlans")}
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.3)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{plan.name}</span>
                        {plan.is_popular && (
                          <Badge variant="default" className="text-xs">{t("subscription.popular")}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))] hidden md:table-cell max-w-[200px] truncate">
                      {plan.description}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {plan.price} DA
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">
                        {plan.billing_cycle === "monthly" ? t("admin.monthly") : t("admin.yearly")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--muted-fg))] hidden lg:table-cell max-w-[200px] truncate">
                      {plan.features?.join(", ")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Switch checked={plan.is_active} onCheckedChange={() => handleToggleActive(plan)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(plan)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingPlan(plan);
                            setDeleteDialogOpen(true);
                          }}
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

      {/* Create/Edit Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPlan ? t("admin.editPlan") : t("admin.addPlan")}</DialogTitle>
            <DialogDescription>{editingPlan ? t("admin.editPlanDesc") : t("admin.addPlanDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("admin.planName")}</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t("admin.planDescription")}</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("admin.planPrice")}</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("admin.planBilling")}</Label>
                <select
                  value={formData.billing_cycle}
                  onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                >
                  <option value="monthly">{t("admin.monthly")}</option>
                  <option value="yearly">{t("admin.yearly")}</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t("admin.planFeatures")}</Label>
              <Textarea
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                rows={4}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("admin.planActive")}</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>{t("subscription.popular")}</Label>
              <Switch
                checked={formData.is_popular}
                onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Plan Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("admin.deletePlan")}</DialogTitle>
            <DialogDescription>{t("admin.confirmDelete")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>{t("common.cancel")}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t("common.delete")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
