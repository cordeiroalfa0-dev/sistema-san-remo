-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SUPABASE

-- 1. Criar a tabela de envios (caso não exista)
CREATE TABLE IF NOT EXISTS public.envios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES public.materiais(id) ON DELETE CASCADE,
    origem TEXT NOT NULL,
    destino TEXT NOT NULL,
    quantidade INTEGER NOT NULL,
    observacao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Habilitar RLS (Segurança)
ALTER TABLE public.envios ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de acesso público (para teste/desenvolvimento)
DROP POLICY IF EXISTS "Permitir tudo para envios" ON public.envios;
CREATE POLICY "Permitir tudo para envios" ON public.envios FOR ALL USING (true) WITH CHECK (true);

-- 4. Garantir que a tabela materiais também tenha RLS configurado corretamente
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para materiais" ON public.materiais;
CREATE POLICY "Permitir tudo para materiais" ON public.materiais FOR ALL USING (true) WITH CHECK (true);

-- 5. CORREÇÃO DE DUPLICIDADE DE CHAVE (SOLICITADO PELO USUÁRIO)
-- Remove a restrição UNIQUE do codigo_remo para permitir que o estoque seja dividido entre destinos
-- mantendo o mesmo código de rastreio original.

ALTER TABLE materiais DROP CONSTRAINT IF EXISTS materiais_codigo_remo_key;

-- 6. Atualizar o índice para não ser único
DROP INDEX IF EXISTS idx_materiais_codigo_remo;
CREATE INDEX idx_materiais_codigo_remo ON materiais(codigo_remo);
