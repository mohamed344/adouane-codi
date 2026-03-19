"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Trash2, Shield, Calendar, Mail, Phone, Search, Loader2 } from "lucide-react";
import { useAdmin, type UserRow } from "../context";

export default function AdminUsersPage() {
  const t = useTranslations();
  const { users, loading, fetchData } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);
  const [disablingUser, setDisablingUser] = useState(false);

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

  async function handleToggleUserRole(user: UserRow) {
    const supabase = createClient();
    const newRole = user.role === "admin" ? "user" : "admin";
    const { error } = await supabase.from("users").update({ role: newRole }).eq("id", user.id);
    if (error) {
      toast({ variant: "destructive", title: t("admin.userUpdateError") });
    } else {
      toast({ variant: "success", title: t("admin.userUpdated") });
    }
    fetchData();
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t("admin.usersManager")}</h1>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("admin.searchUsers")}
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
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">{t("admin.noUsers")}</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary shrink-0">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{user.first_name} {user.last_name}</p>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs shrink-0">
                        {user.role === "admin" ? (
                          <><Shield className="h-3 w-3 mr-1" />{t("admin.adminRole")}</>
                        ) : (
                          t("admin.userRole")
                        )}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          {user.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleUserRole(user)}
                      title={user.role === "admin" ? t("admin.demoteUser") : t("admin.promoteUser")}
                    >
                      <Shield className="h-4 w-4" />
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}
