-- ============================================================================
-- Abreu Móveis — Schema do Banco de Dados e Storage (Supabase)
-- Execute este script no SQL Editor do seu projeto Supabase.
-- ============================================================================

-- 1. Tabela de produtos
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  category text not null check (
    category in ('Sofás', 'Camas', 'Mesas', 'Cadeiras', 'Armários', 'Outros')
  ),
  image_url text not null,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Tabela de configurações da loja (registro único id = 1)
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text not null default '',
  store_name text not null default 'Temtudo Decorala',
  updated_at timestamptz not null default now()
);

-- Garante que exista a linha inicial de configurações (sem produtos fictícios)
insert into public.store_settings (id, whatsapp_number, store_name)
values (1, '', 'Temtudo Decorala')
on conflict (id) do nothing;

-- 3. Trigger para atualizar updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

drop trigger if exists set_store_settings_updated_at on public.store_settings;
create trigger set_store_settings_updated_at
  before update on public.store_settings
  for each row execute function public.handle_updated_at();

-- 4. Row Level Security (RLS)
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

-- Produtos: leitura pública, escrita apenas para administrador autenticado
drop policy if exists "Produtos visíveis para todos" on public.products;
create policy "Produtos visíveis para todos"
  on public.products for select
  using (true);

drop policy if exists "Admin pode inserir produtos" on public.products;
create policy "Admin pode inserir produtos"
  on public.products for insert
  to authenticated
  with check (true);

drop policy if exists "Admin pode atualizar produtos" on public.products;
create policy "Admin pode atualizar produtos"
  on public.products for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "Admin pode excluir produtos" on public.products;
create policy "Admin pode excluir produtos"
  on public.products for delete
  to authenticated
  using (true);

-- Configurações: leitura pública (para gerar o link do WhatsApp), escrita apenas para admin
drop policy if exists "Configurações visíveis para todos" on public.store_settings;
create policy "Configurações visíveis para todos"
  on public.store_settings for select
  using (true);

drop policy if exists "Admin pode inserir configurações" on public.store_settings;
create policy "Admin pode inserir configurações"
  on public.store_settings for insert
  to authenticated
  with check (id = 1);

drop policy if exists "Admin pode atualizar configurações" on public.store_settings;
create policy "Admin pode atualizar configurações"
  on public.store_settings for update
  to authenticated
  using (id = 1)
  with check (id = 1);

-- 5. Bucket de Storage para fotos dos produtos
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Imagens públicas para visualização" on storage.objects;
create policy "Imagens públicas para visualização"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admin pode enviar imagens" on storage.objects;
create policy "Admin pode enviar imagens"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "Admin pode atualizar imagens" on storage.objects;
create policy "Admin pode atualizar imagens"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "Admin pode excluir imagens" on storage.objects;
create policy "Admin pode excluir imagens"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images');

