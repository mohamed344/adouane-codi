-- ============================================
-- Supabase Database Initialization
-- ============================================
-- Run each file in order, or run this file
-- which includes all steps sequentially.
--
-- Order:
--   01_tables.sql       → Create all tables
--   02_rls_policies.sql → Enable RLS and create policies
--   03_triggers.sql     → Functions and triggers (e.g. auto-create user on signup)
--   04_seed.sql         → Insert sample data (plans)
-- ============================================

-- 1. Tables
\i 01_tables.sql

-- 2. RLS Policies
\i 02_rls_policies.sql

-- 3. Triggers
\i 03_triggers.sql

-- 4. Seed Data
\i 04_seed.sql

-- 5. Tariff Schema Fix (add missing columns, rangees table, search RPC)
\i 08_tariff_schema_fix.sql
