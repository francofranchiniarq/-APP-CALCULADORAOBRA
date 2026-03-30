-- ═══════════════════════════════════════════════════════════════
-- Metriq — Limpiar tablas existentes antes de crear el schema
--
-- EJECUTAR PRIMERO si ya tenés tablas creadas en Supabase.
-- CASCADE borra todas las dependencias automáticamente.
-- ═══════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS public.certificaciones CASCADE;
DROP TABLE IF EXISTS public.gantt_task_presupuesto CASCADE;
DROP TABLE IF EXISTS public.gantt_tasks CASCADE;
DROP TABLE IF EXISTS public.presupuesto_items CASCADE;
DROP TABLE IF EXISTS public.computos CASCADE;
DROP TABLE IF EXISTS public.planos CASCADE;
DROP TABLE IF EXISTS public.calculos CASCADE;
DROP TABLE IF EXISTS public.obras CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Limpiar funciones y triggers viejos
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.set_updated_at();
