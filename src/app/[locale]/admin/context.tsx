"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billing_cycle: string;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
}

export interface UserRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string;
  created_at: string;
  users: { first_name: string; last_name: string; email: string } | null;
  plans: { name: string; price: number } | null;
}

export interface Stats {
  totalUsers: number;
  totalSubscriptions: number;
  totalPlans: number;
  revenue: number;
}

interface AdminContextType {
  plans: Plan[];
  users: UserRow[];
  subscriptions: Subscription[];
  stats: Stats;
  loading: boolean;
  fetchData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSubscriptions: 0,
    totalPlans: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const supabase = createClient();

    const [plansRes, usersRes, subsCountRes, allUsersRes, allSubsRes] = await Promise.all([
      supabase.from("plans").select("*").order("price", { ascending: true }),
      supabase.from("users").select("id", { count: "exact", head: true }),
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("*, users(first_name, last_name, email), plans(name, price)").order("created_at", { ascending: false }),
    ]);

    if (plansRes.data) setPlans(plansRes.data);
    if (allUsersRes.data) setUsers(allUsersRes.data);
    if (allSubsRes.error) {
      console.error("Error fetching subscriptions:", allSubsRes.error);
    }
    if (allSubsRes.data) {
      setSubscriptions(allSubsRes.data as Subscription[]);
    }

    const totalRevenue = allSubsRes.data
      ? (allSubsRes.data as Subscription[]).reduce((sum, s) => sum + ((s as Subscription).plans?.price || 0), 0)
      : 0;

    setStats({
      totalUsers: usersRes.count ?? 0,
      totalSubscriptions: subsCountRes.count ?? 0,
      totalPlans: plansRes.data?.length ?? 0,
      revenue: totalRevenue,
    });

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AdminContext.Provider value={{ plans, users, subscriptions, stats, loading, fetchData }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
