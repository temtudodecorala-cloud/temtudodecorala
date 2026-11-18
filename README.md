# Temtudo Decoralar — Loja Virtual Simples

Vitrine virtual minimalista para loja de móveis com catálogo gerenciado pelo administrador via Supabase e atendimento direto pelo WhatsApp.

## Funcionalidades

- **Vitrine Pública**:
  - Página inicial com banner, categorias (`Sofás`, `Camas`, `Mesas`, `Cadeiras`, `Armários` e `Outros`) e lista de produtos disponíveis.
  - Página `/produtos` com filtro por categoria e busca.
  - Página `/produto/:id` com foto, descrição completa, preço e botão **Comprar pelo WhatsApp** com mensagem automática preenchida.
- **Painel Administrativo (`/admin`)**:
  - Protegido por autenticação de e-mail e senha (Supabase Auth).
  - Cadastro, edição e exclusão de produtos com upload de foto no Supabase Storage.
  - Configuração do número do WhatsApp e nome da loja.
  - Atualização automática na vitrine via Supabase Realtime.

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. No painel do Supabase, abra o **SQL Editor** e execute o conteúdo completo de [`supabase/schema.sql`](supabase/schema.sql).
3. Em **Authentication > Users**, clique em **Add user** e crie o e-mail e senha do administrador.
4. Copie o arquivo `.env.example` para `.env` e preencha com a URL e a chave `anon` do seu projeto:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
   ```

## Como executar localmente

```bash
npm install
npm run dev
```

Para gerar a build de produção:

```bash
npm run build
```

