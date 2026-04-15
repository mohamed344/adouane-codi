"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  CreditCard,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useAdmin } from "./context";

const CHART_COLORS = ["#0d9488", "#ef4444", "#94a3b8", "#1e3a5f", "#10b981"];

export default function AdminDashboardPage() {
  const t = useTranslations();
  const { users, subscriptions, stats, loading } = useAdmin();

  const userGrowthData = useMemo(() => {
    const months: Record<string, number> = {};
    users.forEach((u) => {
      const date = new Date(u.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({
        month: new Date(month + "-01").toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
        users: count,
      }));
  }, [users]);

  const subscriptionStatusData = useMemo(() => {
    const counts: Record<string, number> = { active: 0, cancelled: 0, expired: 0 };
    subscriptions.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({ name: status, value: count }));
  }, [subscriptions]);

  const revenueByPlanData = useMemo(() => {
    const planRevenue: Record<string, { name: string; revenue: number; count: number }> = {};
    subscriptions.forEach((s) => {
      if (s.plans?.name && s.plans?.price) {
        const name = s.plans.name;
        if (!planRevenue[name]) planRevenue[name] = { name, revenue: 0, count: 0 };
        planRevenue[name].revenue += s.plans.price;
        planRevenue[name].count += 1;
      }
    });
    return Object.values(planRevenue);
  }, [subscriptions]);

  const newUsersThisMonth = useMemo(() => {
    const now = new Date();
    return users.filter((u) => {
      const d = new Date(u.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [users]);

  const actualRevenue = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + (s.plans?.price || 0), 0);
  }, [subscriptions]);

  const statCards = [
    { icon: Users, label: t("admin.totalUsers"), value: stats.totalUsers, color: "text-blue-500", bg: "bg-blue-500/10" },
    { icon: TrendingUp, label: t("admin.newUsersThisMonth"), value: newUsersThisMonth, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { icon: CreditCard, label: t("admin.totalSubscriptions"), value: stats.totalSubscriptions, color: "text-green-500", bg: "bg-green-500/10" },
    { icon: Activity, label: t("admin.subscriptionRate"), value: stats.totalUsers > 0 ? `${Math.round((stats.totalSubscriptions / stats.totalUsers) * 100)}%` : "0%", color: "text-amber-500", bg: "bg-amber-500/10" },
    { icon: FileText, label: t("admin.totalPlans"), value: stats.totalPlans, color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: DollarSign, label: t("admin.revenue"), value: `${actualRevenue.toLocaleString()} DA`, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">{t("admin.dashboard")}</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {loading
          ? [1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 pt-6">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, i) => (
              <Card key={i} className="hover:bg-muted/30 transition-colors">
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className={`rounded-full ${stat.bg} p-3`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {userGrowthData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("admin.userGrowth")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="#0d9488" fill="#0d9488" fillOpacity={0.12} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {subscriptionStatusData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("admin.subscriptionDistribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={subscriptionStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {subscriptionStatusData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {revenueByPlanData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">{t("admin.revenueByPlan")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={revenueByPlanData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "revenue" ? `${Number(value).toLocaleString()} DA` : value,
                        name === "revenue" ? t("admin.revenue") : t("admin.subscriptionCount"),
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recent Users & Subscriptions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("admin.recentUsers")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">{t("admin.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">{user.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{t("admin.recentSubscriptions")}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/subscriptions">{t("admin.viewAll")}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.slice(0, 5).map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-sm font-semibold text-green-500">
                      <CreditCard className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sub.users?.first_name} {sub.users?.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{sub.plans?.name} - ${sub.plans?.price}</p>
                    </div>
                    <Badge variant={sub.status === "active" ? "default" : sub.status === "cancelled" ? "destructive" : "secondary"} className="text-xs">{sub.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
