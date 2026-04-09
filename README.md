# Kitchen Ops

Proyecto base limpio con:

- Next.js (App Router)
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- Tailwind CSS
- shadcn/ui

## Primeros pasos

1. Crea tu archivo `.env.local` desde `.env.example`.
2. Completa:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

3. Instala dependencias y ejecuta en local:

```bash
npm install
npm run dev
```

## Estructura base

- `app/` rutas y layout principal
- `components/ui/` componentes de shadcn/ui
- `lib/supabase/client.ts` cliente browser para Supabase
- `lib/supabase/server.ts` cliente server para Supabase
- `lib/utils.ts` utilidades compartidas (`cn`)

## shadcn/ui

El proyecto ya está inicializado con `components.json`.

Para agregar componentes nuevos:

```bash
npx shadcn@latest add button card input dialog table
```
