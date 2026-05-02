# Supabase Setup

## 1. Criar projeto

Crie um projeto em supabase.com. Anote:
- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Executar schema

No SQL Editor do Supabase, execute o conteúdo de `schema.sql`.

## 3. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha todas as variáveis.

## 4. Auth

No Supabase Dashboard:
- Authentication → Settings
- Site URL: `http://localhost:3000` (dev) / sua URL de produção
- Redirect URLs: adicione `http://localhost:3000/**`
