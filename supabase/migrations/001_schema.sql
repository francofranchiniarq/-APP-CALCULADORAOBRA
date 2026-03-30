-- ═══════════════════════════════════════════════════════════════
-- Metriq — Schema completo para Supabase (PostgreSQL)
-- Flujo BIM 4D/5D: Planos → Cómputos → Presupuestos → Gantt → Certificaciones
--
-- INSTRUCCIONES:
-- 1. Abrí el SQL Editor en tu dashboard de Supabase
-- 2. Pegá TODO este archivo y ejecutalo
-- 3. En Authentication > URL Configuration, agregá tu redirect URL:
--    http://localhost:5173 (dev) y tu dominio de producción
-- 4. (Opcional) En Authentication > Providers, habilitá Google OAuth
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. PROFILES (extiende auth.users) ───────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  name        TEXT DEFAULT '',
  role        TEXT DEFAULT 'profesional'
                CHECK (role IN ('instalador', 'profesional', 'empresa')),
  plan        TEXT DEFAULT 'free'
                CHECK (plan IN ('free', 'pro', 'enterprise')),
  rubro       TEXT DEFAULT '',
  scale       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, rubro, scale)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'profesional'),
    COALESCE(NEW.raw_user_meta_data->>'rubro', ''),
    COALESCE(NEW.raw_user_meta_data->>'scale', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. OBRAS (proyectos) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.obras (
  id          TEXT PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nombre      TEXT NOT NULL,
  direccion   TEXT DEFAULT '',
  cliente     TEXT DEFAULT '',
  tipo        TEXT DEFAULT 'Vivienda Unifamiliar',
  estado      TEXT DEFAULT 'activo'
                CHECK (estado IN ('activo', 'presupuesto', 'finalizado')),
  presupuesto NUMERIC DEFAULT 0,
  avance      NUMERIC DEFAULT 0,
  modulos     JSONB DEFAULT '[]'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. CALCULOS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.calculos (
  id          TEXT PRIMARY KEY,
  obra_id     TEXT NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  modulo_id   TEXT NOT NULL,
  modulo_name TEXT DEFAULT '',
  valores     JSONB DEFAULT '{}'::JSONB,
  resultado   JSONB DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. PLANOS ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.planos (
  id           TEXT PRIMARY KEY,
  obra_id      TEXT NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nombre       TEXT NOT NULL,
  disciplina   TEXT DEFAULT 'Arquitectura',
  version      INTEGER DEFAULT 1,
  archivo_url  TEXT DEFAULT '',
  archivo_tipo TEXT DEFAULT 'pdf',
  escala       TEXT,
  notas        TEXT DEFAULT '',
  creado_por   UUID REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. COMPUTOS ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.computos (
  id          TEXT PRIMARY KEY,
  obra_id     TEXT NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  plano_id    TEXT REFERENCES public.planos(id) ON DELETE SET NULL,
  calculo_id  TEXT REFERENCES public.calculos(id) ON DELETE SET NULL,
  modulo_id   TEXT DEFAULT '',
  rubro       TEXT DEFAULT '',
  descripcion TEXT DEFAULT '',
  unidad      TEXT DEFAULT 'u',
  cantidad    NUMERIC DEFAULT 0,
  ubicacion   TEXT DEFAULT '',
  notas       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. PRESUPUESTO ITEMS ────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.presupuesto_items (
  id               TEXT PRIMARY KEY,
  obra_id          TEXT NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  computo_id       TEXT REFERENCES public.computos(id) ON DELETE CASCADE,
  rubro            TEXT DEFAULT '',
  descripcion      TEXT DEFAULT '',
  unidad           TEXT DEFAULT 'u',
  cantidad         NUMERIC DEFAULT 0,
  precio_unitario  NUMERIC DEFAULT 0,
  moneda           TEXT DEFAULT 'ARS',
  subtotal         NUMERIC GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  proveedor        TEXT,
  notas            TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 7. GANTT TASKS ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gantt_tasks (
  id         TEXT PRIMARY KEY,
  obra_id    TEXT NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  gremio     TEXT DEFAULT '',
  grupo      TEXT DEFAULT 'Obra Gruesa',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  progreso   NUMERIC DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
  milestone  BOOLEAN DEFAULT FALSE,
  color      TEXT DEFAULT '#3F3F3F',
  estado     TEXT DEFAULT 'pendiente'
               CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
  deps       JSONB DEFAULT '[]'::JSONB,
  notas      TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. GANTT ↔ PRESUPUESTO (tabla puente N:M) ──────────────

CREATE TABLE IF NOT EXISTS public.gantt_task_presupuesto (
  id                   TEXT PRIMARY KEY,
  gantt_task_id        TEXT NOT NULL REFERENCES public.gantt_tasks(id) ON DELETE CASCADE,
  presupuesto_item_id  TEXT NOT NULL REFERENCES public.presupuesto_items(id) ON DELETE CASCADE,
  porcentaje           NUMERIC DEFAULT 100 CHECK (porcentaje > 0 AND porcentaje <= 100),
  UNIQUE(gantt_task_id, presupuesto_item_id)
);

-- ─── 9. CERTIFICACIONES ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.certificaciones (
  id                TEXT PRIMARY KEY,
  obra_id           TEXT NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  gantt_task_id     TEXT NOT NULL REFERENCES public.gantt_tasks(id) ON DELETE CASCADE,
  periodo_numero    INTEGER DEFAULT 1,
  periodo_desde     TIMESTAMPTZ,
  periodo_hasta     TIMESTAMPTZ,
  progreso_anterior NUMERIC DEFAULT 0,
  progreso_actual   NUMERIC DEFAULT 0,
  delta             NUMERIC GENERATED ALWAYS AS (progreso_actual - progreso_anterior) STORED,
  monto_base        NUMERIC DEFAULT 0,
  monto_certificado NUMERIC DEFAULT 0,
  estado            TEXT DEFAULT 'borrador'
                      CHECK (estado IN ('borrador', 'emitido', 'aprobado', 'pagado')),
  observaciones     TEXT DEFAULT '',
  aprobado_por      UUID REFERENCES public.profiles(id),
  fecha_aprobacion  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_obras_user_id ON public.obras(user_id);
CREATE INDEX IF NOT EXISTS idx_calculos_obra_id ON public.calculos(obra_id);
CREATE INDEX IF NOT EXISTS idx_planos_obra_id ON public.planos(obra_id);
CREATE INDEX IF NOT EXISTS idx_computos_obra_id ON public.computos(obra_id);
CREATE INDEX IF NOT EXISTS idx_presupuesto_items_obra_id ON public.presupuesto_items(obra_id);
CREATE INDEX IF NOT EXISTS idx_gantt_tasks_obra_id ON public.gantt_tasks(obra_id);
CREATE INDEX IF NOT EXISTS idx_certificaciones_obra_id ON public.certificaciones(obra_id);
CREATE INDEX IF NOT EXISTS idx_certificaciones_gantt_task ON public.certificaciones(gantt_task_id);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Cada usuario solo ve/modifica sus propios datos.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.computos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuesto_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_tasks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gantt_task_presupuesto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificaciones      ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuario su propio perfil
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Obras: CRUD propio
CREATE POLICY "obras_all_own" ON public.obras
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cálculos: acceso vía obra propia
CREATE POLICY "calculos_all_own" ON public.calculos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.obras WHERE id = calculos.obra_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.obras WHERE id = calculos.obra_id AND user_id = auth.uid())
  );

-- Planos: acceso vía obra propia
CREATE POLICY "planos_all_own" ON public.planos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.obras WHERE id = planos.obra_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.obras WHERE id = planos.obra_id AND user_id = auth.uid())
  );

-- Cómputos: acceso vía obra propia
CREATE POLICY "computos_all_own" ON public.computos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.obras WHERE id = computos.obra_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.obras WHERE id = computos.obra_id AND user_id = auth.uid())
  );

-- Presupuesto Items: acceso vía obra propia
CREATE POLICY "presupuesto_items_all_own" ON public.presupuesto_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.obras WHERE id = presupuesto_items.obra_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.obras WHERE id = presupuesto_items.obra_id AND user_id = auth.uid())
  );

-- Gantt Tasks: acceso vía obra propia
CREATE POLICY "gantt_tasks_all_own" ON public.gantt_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.obras WHERE id = gantt_tasks.obra_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.obras WHERE id = gantt_tasks.obra_id AND user_id = auth.uid())
  );

-- Gantt ↔ Presupuesto: acceso vía tarea propia
CREATE POLICY "gantt_task_presupuesto_all_own" ON public.gantt_task_presupuesto
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.gantt_tasks gt
      JOIN public.obras o ON o.id = gt.obra_id
      WHERE gt.id = gantt_task_presupuesto.gantt_task_id AND o.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.gantt_tasks gt
      JOIN public.obras o ON o.id = gt.obra_id
      WHERE gt.id = gantt_task_presupuesto.gantt_task_id AND o.user_id = auth.uid()
    )
  );

-- Certificaciones: acceso vía obra propia
CREATE POLICY "certificaciones_all_own" ON public.certificaciones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.obras WHERE id = certificaciones.obra_id AND user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.obras WHERE id = certificaciones.obra_id AND user_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════
-- HELPER: updated_at automático
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'profiles', 'obras', 'planos', 'computos',
    'presupuesto_items', 'gantt_tasks', 'certificaciones'
  ] LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I; '
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END $$;
