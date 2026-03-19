"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-10 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t("admin.noPlans")}</p>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.is_popular && (
                        <Badge variant="default" className="text-xs">{t("subscription.popular")}</Badge>
                      )}
                      <Badge variant={plan.is_active ? "default" : "secondary"}>
                        {plan.is_active ? t("admin.planActive") : t("admin.planInactive")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-lg font-bold mt-1">
                      ${plan.price}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.billing_cycle === "monthly" ? t("admin.monthly") : t("admin.yearly")}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={plan.is_active} onCheckedChange={() => handleToggleActive(plan)} />
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(plan)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeletingPlan(plan);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
