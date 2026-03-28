-- ══════════════════════════════════════════════════════════════
-- Metriq — Schema inicial de Supabase
-- Pegá este archivo completo en el SQL Editor de tu proyecto
-- en supabase.com → SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════════

-- ── 1. PROFILES (extiende auth.users) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nombre        TEXT,
  role          TEXT DEFAULT 'profesional'
                     CHECK (role IN ('profesional','instalador','empresa')),
  rubro         TEXT,
  empresa       TEXT,
  scale         TEXT,
  problems      TEXT[]   DEFAULT '{}',
  plan          TEXT     DEFAULT 'starter'
                         CHECK (plan IN ('starter','pro','estudio','constructora','enterprise')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. OBRAS (proyectos de construcción) ──────────────────────
CREATE TABLE IF NOT EXISTS public.obras (
  id                UUID     DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id          UUID     REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nombre            TEXT     NOT NULL,
  tipo              TEXT,
  direccion         TEXT,
  comitente         TEXT,
  estado            TEXT     DEFAULT 'activo'
                             CHECK (estado IN ('activo','presupuesto','finalizado','pausado')),
  presupuesto_total NUMERIC  DEFAULT 0,
  progreso          INTEGER  DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
  fecha_inicio      DATE,
  fecha_entrega     DATE,
  notas             TEXT,
  -- Campos BIM (para integración futura con Speckle/IFC)
  speckle_stream_id TEXT,
  ifc_file_url      TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. GANTT_TASKS (tareas del cronograma por obra) ───────────
CREATE TABLE IF NOT EXISTS public.gantt_tasks (
  id               TEXT     NOT NULL,
  obra_id          UUID     REFERENCES public.obras(id) ON DELETE CASCADE NOT NULL,
  nombre           TEXT     NOT NULL,
  gremio           TEXT,
  grupo            TEXT,
  fecha_inicio     DATE,
  fecha_fin        DATE,
  progreso         INTEGER  DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
  milestone        BOOLEAN  DEFAULT FALSE,
  color            TEXT     DEFAULT '#6B7280',
  estado           TEXT     CHECK (estado IN ('pendiente','en_progreso','completada','retrasada') OR estado IS NULL),
  deps             JSONB    DEFAULT '[]'::JSONB,
  notas            TEXT,
  linked_budget_id TEXT,
  -- Campos BIM (para vinculación futura)
  ifc_guid         TEXT,
  ifc_type         TEXT,
  speckle_object_id TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, obra_id)
);

-- ── 4. COTIZACIONES (para rol instalador) ─────────────────────
CREATE TABLE IF NOT EXISTS public.cotizaciones (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id   UUID    REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  obra_id    UUID    REFERENCES public.obras(id) ON DELETE SET NULL,
  cliente    TEXT,
  direccion  TEXT,
  fecha      DATE    DEFAULT CURRENT_DATE,
  total      NUMERIC DEFAULT 0,
  estado     TEXT    DEFAULT 'pendiente'
                     CHECK (estado IN ('pendiente','enviado','aprobado','rechazado')),
  notas      TEXT,
  items_json JSONB   DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 5. LEADS (datos de onboarding, sin autenticación) ─────────
CREATE TABLE IF NOT EXISTS public.leads (
  id           UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  email        TEXT,
  role         TEXT,
  rubro        TEXT,
  problems     TEXT[],
  scale        TEXT,
  user_agent   TEXT,
  screen_width INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- FUNCIONES Y TRIGGERS
-- ══════════════════════════════════════════════════════════════

-- Crea el perfil automáticamente cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  probs TEXT[];
BEGIN
  -- Convertir el array de problemas desde JSON metadata
  SELECT ARRAY(
    SELECT jsonb_array_elements_text(
      COALESCE(NEW.raw_user_meta_data->'problems', '[]'::jsonb)
    )
  ) INTO probs;

  INSERT INTO public.profiles (id, nombre, role, rubro, empresa, scale, problems)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'profesional'),
    NEW.raw_user_meta_data->>'rubro',
    NEW.raw_user_meta_data->>'empresa',
    NEW.raw_user_meta_data->>'scale',
    probs
  );
  RETURN NEW;
END;
$$;

-- Trigger: ejecutar handle_new_user después de cada INSERT en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Actualiza updated_at automáticamente
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER obras_updated_at
  BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE TRIGGER gantt_tasks_updated_at
  BEFORE UPDATE ON public.gantt_tasks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_tasks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cotizaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads         ENABLE ROW LEVEL SECURITY;

-- profiles: cada usuario solo ve y edita el suyo
CREATE POLICY "profiles_own"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- obras: solo el dueño puede ver y modificar
CREATE POLICY "obras_own"
  ON public.obras FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- gantt_tasks: heredado del dueño de la obra
CREATE POLICY "gantt_tasks_own"
  ON public.gantt_tasks FOR ALL
  USING (
    obra_id IN (SELECT id FROM public.obras WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    obra_id IN (SELECT id FROM public.obras WHERE owner_id = auth.uid())
  );

-- cotizaciones: solo el dueño
CREATE POLICY "cotizaciones_own"
  ON public.cotizaciones FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- leads: cualquiera puede insertar (onboarding público), nadie puede leer
CREATE POLICY "leads_insert_only"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- DATOS INICIALES DE EJEMPLO (opcional — borrar en producción)
-- ══════════════════════════════════════════════════════════════
-- Después de crear tu primer usuario, podés insertar obras de ejemplo:
-- INSERT INTO public.obras (owner_id, nombre, tipo, estado, progreso)
-- VALUES ('<TU_USER_ID>', 'Edificio Rosario Centro', 'Edificio Residencial', 'activo', 65);
