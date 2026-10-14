-- ==============================================================================
-- FITNESS EVOLUTION — MIGRACIÓN INICIAL SUPABASE / POSTGRESQL CON RLS
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL DEFAULT '',
    birth_date DATE NOT NULL,
    sex TEXT NOT NULL CHECK (sex IN ('male', 'female')),
    height_cm NUMERIC(5,1) NOT NULL,
    initial_weight_kg NUMERIC(5,2) NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    training_days_per_week SMALLINT NOT NULL CHECK (training_days_per_week BETWEEN 0 AND 7),
    daily_activity TEXT NOT NULL CHECK (daily_activity IN ('sedentary', 'light', 'moderate', 'high', 'very_high')),
    avg_sleep_hours NUMERIC(3,1) DEFAULT 7.5,
    avg_daily_steps INTEGER DEFAULT 8000,
    body_fat_pct NUMERIC(4,1),
    bmr_method TEXT NOT NULL DEFAULT 'mifflin_st_jeor',
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- 3. PREFERENCIAS DEL USUARIO
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    disliked_food_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    unavailable_food_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    allergies JSONB NOT NULL DEFAULT '[]'::jsonb,
    dietary_restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
    budget TEXT NOT NULL DEFAULT 'medium' CHECK (budget IN ('low', 'medium', 'high')),
    meals_per_day SMALLINT NOT NULL DEFAULT 4 CHECK (meals_per_day BETWEEN 3 AND 6),
    work_schedule TEXT,
    training_time TEXT,
    equipment JSONB NOT NULL DEFAULT '["barbell", "dumbbell", "machine", "cable", "bench"]'::jsonb,
    available_weekdays JSONB NOT NULL DEFAULT '[1,2,3,4,5,6]'::jsonb,
    session_minutes SMALLINT NOT NULL DEFAULT 60,
    step_goal INTEGER NOT NULL DEFAULT 8000,
    water_goal_ml INTEGER NOT NULL DEFAULT 2500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- 4. OBJETIVOS
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    primary_goal TEXT NOT NULL,
    secondary_goals JSONB NOT NULL DEFAULT '[]'::jsonb,
    start_weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2) NOT NULL,
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    feasibility TEXT NOT NULL,
    plan_calories INTEGER NOT NULL,
    protein_g INTEGER NOT NULL,
    fat_g INTEGER NOT NULL,
    carbs_g INTEGER NOT NULL,
    fiber_g INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    accepted_alternative TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- 5. REGISTRO DE PESO Y MEDIDAS
CREATE TABLE IF NOT EXISTS public.weight_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL DEFAULT CURRENT_TIME,
    weight_kg NUMERIC(5,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_weight_logs_user_date ON public.weight_logs(user_id, date);

CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    waist_cm NUMERIC(4,1),
    abdomen_cm NUMERIC(4,1),
    hip_cm NUMERIC(4,1),
    chest_cm NUMERIC(4,1),
    arm_cm NUMERIC(4,1),
    thigh_cm NUMERIC(4,1),
    body_fat_pct NUMERIC(4,1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- 6. FOTOS DE PROGRESO
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    pose TEXT NOT NULL CHECK (pose IN ('front', 'side', 'back')),
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- 7. PLANES DE ENTRENAMIENTO Y RUTINAS
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    source TEXT NOT NULL,
    split TEXT NOT NULL,
    based_on_plan_id UUID,
    warmup_min SMALLINT NOT NULL DEFAULT 10,
    notes JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.workout_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
    title TEXT NOT NULL,
    is_rest BOOLEAN NOT NULL DEFAULT FALSE,
    position SMALLINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.workout_plans(id) ON DELETE CASCADE,
    day_id UUID NOT NULL REFERENCES public.workout_days(id) ON DELETE CASCADE,
    exercise_id TEXT NOT NULL,
    position SMALLINT NOT NULL DEFAULT 0,
    sets SMALLINT NOT NULL DEFAULT 3,
    reps_min SMALLINT NOT NULL DEFAULT 8,
    reps_max SMALLINT NOT NULL DEFAULT 12,
    rir_min SMALLINT,
    rir_max SMALLINT,
    rest_sec SMALLINT NOT NULL DEFAULT 90,
    superset TEXT,
    notes TEXT,
    sets_assumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- 8. SESIONES Y SERIES EJECUTADAS
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    day_id UUID REFERENCES public.workout_days(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'skipped')),
    perceived_effort SMALLINT CHECK (perceived_effort BETWEEN 1 AND 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    workout_exercise_id UUID,
    exercise_id TEXT NOT NULL,
    substituted_from TEXT,
    set_number SMALLINT NOT NULL,
    weight_kg NUMERIC(5,2),
    reps SMALLINT,
    duration_sec INTEGER,
    rir SMALLINT,
    rest_sec SMALLINT,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    is_warmup BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- 9. REGISTROS DIARIOS DE SALUD (COMIDA, AGUA, PASOS, SUEÑO, SÍNTOMAS)
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    slot TEXT NOT NULL CHECK (slot IN ('breakfast', 'lunch', 'dinner', 'snack', 'drink')),
    food_id TEXT NOT NULL,
    food_name TEXT NOT NULL,
    amount NUMERIC(6,1) NOT NULL,
    unit TEXT NOT NULL,
    nutrients JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date ON public.food_logs(user_id, date);

CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    amount_ml INTEGER NOT NULL,
    at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.step_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    steps INTEGER NOT NULL,
    source TEXT NOT NULL DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hours NUMERIC(3,1) NOT NULL,
    quality SMALLINT CHECK (quality BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.symptom_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    night_sweats SMALLINT CHECK (night_sweats BETWEEN 0 AND 3),
    fatigue SMALLINT CHECK (fatigue BETWEEN 0 AND 3),
    muscle_soreness SMALLINT CHECK (muscle_soreness BETWEEN 0 AND 3),
    joint_pain SMALLINT CHECK (joint_pain BETWEEN 0 AND 3),
    stress SMALLINT CHECK (stress BETWEEN 0 AND 3),
    energy SMALLINT CHECK (energy BETWEEN 1 AND 5),
    sleep_quality SMALLINT CHECK (sleep_quality BETWEEN 1 AND 5),
    readiness TEXT CHECK (readiness IN ('tired', 'ok', 'strong')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.weekly_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    avg_weight_kg NUMERIC(5,2),
    weight_delta_kg NUMERIC(5,2),
    waist_delta_cm NUMERIC(4,1),
    adherence_pct SMALLINT,
    hunger SMALLINT,
    energy SMALLINT,
    sleep SMALLINT,
    pain SMALLINT,
    stress SMALLINT,
    recommendation TEXT NOT NULL,
    adjustments JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER NOT NULL DEFAULT 1
);

-- ==============================================================================
-- 10. SEGURIDAD: ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.step_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento estricto por usuario:
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            DROP POLICY IF EXISTS "user_own_isolation_policy" ON public.%I;
            CREATE POLICY "user_own_isolation_policy" ON public.%I
                FOR ALL
                TO authenticated
                USING (auth.uid() = user_id)
                WITH CHECK (auth.uid() = user_id);
        ', tbl, tbl);
    END LOOP;
END $$;

-- 11. VISTA ADMINISTRATIVA ANONIMIZADA (Regla 40 y 43: El admin NO ve datos de salud individuales)
CREATE OR REPLACE VIEW public.admin_aggregated_metrics AS
SELECT 
    COUNT(DISTINCT user_id) AS total_users,
    COUNT(DISTINCT CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN user_id END) AS active_users_30d,
    ROUND(AVG(training_days_per_week), 1) AS avg_training_frequency
FROM public.profiles
WHERE deleted_at IS NULL;
