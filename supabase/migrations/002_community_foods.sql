-- ==============================================================================
-- 002: CATÁLOGO COMUNITARIO DE ALIMENTOS ENRIQUECIDO POR IA
-- Permite que cualquier alimento creado o reconocido por IA sea compartido
-- y sincronizado para todos los usuarios del aplicativo.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.community_foods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'g' CHECK (unit IN ('g', 'ml')),
    per100 JSONB NOT NULL,
    servings JSONB NOT NULL DEFAULT '[]'::jsonb,
    source TEXT NOT NULL DEFAULT 'comunidad_ia',
    tags JSONB NOT NULL DEFAULT '["comunidad", "ia"]'::jsonb,
    notes TEXT,
    contributor_name TEXT DEFAULT 'Usuario',
    confidence_pct SMALLINT DEFAULT 90,
    dietary_insights JSONB DEFAULT '[]'::jsonb,
    upvotes INTEGER NOT NULL DEFAULT 1,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de alto rendimiento para búsqueda rápida insensible a mayúsculas
CREATE INDEX IF NOT EXISTS idx_community_foods_name ON public.community_foods(name);
CREATE INDEX IF NOT EXISTS idx_community_foods_category ON public.community_foods(category);
CREATE INDEX IF NOT EXISTS idx_community_foods_upvotes ON public.community_foods(upvotes DESC);

-- HABILITAR RLS
ALTER TABLE public.community_foods ENABLE ROW LEVEL SECURITY;

-- 1. LECTURA PÚBLICA: Cualquier usuario (autenticado o anónimo) puede leer y buscar
CREATE POLICY "Lectura pública de alimentos de la comunidad"
    ON public.community_foods FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2. INSERCIÓN PÚBLICA: Cualquier usuario puede aportar un alimento creado con IA
CREATE POLICY "Aporte público de alimentos con IA a la comunidad"
    ON public.community_foods FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 3. ACTUALIZACIÓN PÚBLICA PARA VALIDACIONES (UPVOTES):
CREATE POLICY "Validación comunitaria de alimentos (upvotes)"
    ON public.community_foods FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
