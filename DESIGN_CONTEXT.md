# Contexto de design — NR1 Form

Documento de referência para manter o design **consistente** em todo o sistema. Use este contexto em outros chats ou ao criar novas telas/componentes.

---

## 1. Produto

- **Nome:** NR1 Form (ou o nome definido em `VITE_APP_NAME` / `VITE_PRODUCT_NAME`).
- **O que é:** Plataforma de **diagnóstico psicossocial (HSE-IT)** e **canal de denúncias/relatos anônimos**, focada em conformidade com **NR-1**, **Lei 14.457/22** e **ISO 37002**.
- **Público:** RH, compliance, empresas (multi-tenant).
- **Tom:** Confiança, seriedade, profissionalismo, segurança. **Não** é app de wellness; é **compliance e RH**. Inspiração: Supabase, Vercel, Linear, Drata/Vanta (SaaS de compliance).

---

## 2. Stack técnico

- **React 19** + **TypeScript**
- **Vite 7**
- **Tailwind CSS 4**
- **Motion** (Framer Motion): `import { motion } from "motion/react"`
- **Recharts** para gráficos (BarChart, LineChart, etc.)
- **Lucide React** para ícones
- **Supabase** (backend)

---

## 3. Identidade visual unificada (Hero / SaaS premium)

O sistema utiliza **uma única identidade visual** em todas as telas (landing, formulários, admin, canal de denúncias), baseada no hero da LP:

### 3.1 Paleta e componentes (aplicados em todo o app)

- **Uso:** Página inicial, formulários, admin, canal de relatos, Sobre, Privacidade, Contato, Login.
- **Background:** `bg-gradient-to-br from-slate-50 via-white to-slate-50`.
- **Cores principais:**
  - **Primário/CTA:** `slate-900` (botão principal), `slate-800` hover.
  - **Texto:** `slate-900` (títulos), `slate-500` (corpo), `slate-400` (legendas).
  - **Destaque:** `violet-500` / `violet-100` (ênfase em frase, e.g. “uma única plataforma”).
  - **Sucesso/Saudável:** `emerald-500`, `emerald-50`, `emerald-700` (badges de conformidade, indicadores positivos).
  - **Atenção:** `amber-500`, `amber-50`, `amber-700`.
  - **Risco/Alerta:** `red-500` / `#EF4444`.
  - **Bordas:** `slate-200`, `slate-200/60`.
- **Badge de conformidade (ex.: topo do hero):**
  - `bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-medium`
  - Ícone: `ShieldCheck` (Lucide), size ~14px.
- **Botão primário (landing):**
  - `rounded-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 text-base font-semibold shadow-lg shadow-slate-900/10`
  - Ícone à esquerda quando fizer sentido (ex.: `ClipboardList`, 18px).
- **Botão secundário (outline):**
  - `rounded-full border-2 border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-900 px-8 py-3 text-base font-medium`
- **Cards (preview dashboard):**
  - Container: `bg-white/60 backdrop-blur-sm rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-200/40`
  - Card interno: `rounded-2xl border border-slate-100 bg-white p-5`
- **Gráficos (Recharts):**
  - Barras condicionais: `value >= 70` → `#10B981` (emerald), `value >= 50` → `#F59E0B` (amber), senão `#EF4444` (red).
  - BarChart horizontal: `layout="vertical"`, LabelList nome à esquerda e % à direita.
- **Código/protocolo (ex.: WB-7X8K2M9P):**
  - `font-mono font-bold tracking-widest text-slate-700` (text-sm ou conforme hierarquia).

### 3.2 Variáveis CSS e classes globais (style.css)

- **Variáveis:** `--escritorio-escuro` = slate-900; `--escritorio-dourado` = violet-600 (destaque); `--branco-gelo` = slate-50.
- **Background geral:** `.app-bg` — gradiente `from-slate-50 via-white to-slate-50`.
- **Header:** Fundo claro `bg-white/80`, borda `border-slate-200/60`, texto slate, botões primários `bg-slate-900`.
- **Botão primário:** `.btn-escritorio` — `bg-slate-900`, `rounded-full`, `shadow-lg shadow-slate-900/10`.
- **Cards:** `.bg-card-escritorio` — branco, `border border-slate-200`, sombra suave.
- **Inputs:** `.input-escritorio` — `border-slate-200`, focus com borda slate e ring suave.
- **Texto:** `.text-escritorio` = slate-900; secundários com `text-slate-500` / `text-slate-600`.

---

## 4. Layout e estrutura

- **Container geral (conteúdo):** `max-w-7xl mx-auto px-6 lg:px-8` na landing; em outras views pode ser `max-w-4xl` ou `max-w-2xl` conforme necessidade.
- **Hero (landing):** Seção full-width, `py-20 lg:py-28`, grid 2 colunas em desktop: `grid grid-cols-1 lg:grid-cols-2 gap-16 items-center`. Coluna esquerda: texto + CTAs + badges; coluna direita: preview do dashboard.
- **Tipografia hero:**
  - Heading: `text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]`
  - Subtítulo: `text-lg text-slate-500 max-w-lg leading-relaxed`
  - Frase de destaque: `rounded bg-violet-100 px-2` no trecho destacado.
- **Espaçamento:** Generoso (mt-5, mt-6, mt-10, mt-12 entre blocos); seções com `py-16 sm:py-24` ou equivalente.

---

## 5. Acessibilidade e padrões

- **Idioma:** Todo texto de interface em **português do Brasil**.
- **Elementos interativos:** Sempre que possível usar `aria-label` descritivo (ex.: “Iniciar diagnóstico psicossocial HSE-IT”, “Abrir canal para fazer relato ou denúncia anônima”).
- **Gráficos:** Container do gráfico com `role="img"` e `aria-label` descrevendo o conteúdo (ex.: “Gráfico de resultado por dimensão HSE-IT em percentual”).
- **Regiões:** Preview/agrupamentos com `role="region"` e `aria-label` quando ajudarem na navegação por leitores de tela.
- **Botões:** Altura mínima ~48px (`min-h-[48px]`), `min-w-[44px]` para área de toque; ícones decorativos com `aria-hidden`.
- **Redução de movimento:** Respeitar `prefers-reduced-motion: reduce` (ex.: remover `transform` em hovers quando o usuário preferir menos animação).

---

## 6. Animações (Motion)

- **Import:** `import { motion } from "motion/react"`.
- **Entrada hero (coluna esquerda):** fade + deslize da esquerda: `opacity: 0, x: -20` → `opacity: 1, x: 0`; stagger entre filhos (ex.: 0.06s).
- **Entrada coluna direita:** fade + deslize da direita: `x: 20` → `x: 0`, delay ~0.2s.
- **Cards (stagger):** delay incremental (ex.: 0.1 + i * 0.08) para lista de cards.
- **Duração típica:** 0.35–0.5s; easing suave (ex.: `[0.25, 0.46, 0.45, 0.94]`).

---

## 7. Variáveis de ambiente e marca

- **VITE_APP_NAME:** Nome da empresa/app; usado em rodapé, títulos de contexto. Fallback: **"NR1 Form"**.
- **VITE_PRODUCT_NAME:** Nome do produto (ex.: “Diagnóstico HSE-IT”); usado no header. Fallback: **"NR1 Form"**.
- **VITE_APP_LOGO_URL:** URL do logo (header). Fallback: `"/logo.png"`.
- **VITE_TENANT_ID:** Tenant padrão (uso interno). Fallback: `"default"`.

Acessar via `getAppName()`, `getProductName()`, `getAppLogoUrl()`, `getTenantId()` em `src/lib/tenant.ts`.

---

## 8. Estrutura de pastas (landing/hero)

```
src/
  components/
    landing/
      hero/
        HeroSection.tsx      # Layout: grid 2 colunas, section wrapper
        HeroContent.tsx       # Coluna esquerda: badge, título, subtítulo, CTAs, selos
        HeroDashboard.tsx    # Coluna direita: container do preview
        DimensionChart.tsx   # Recharts BarChart horizontal (7 dimensões, cores condicionais)
        MetricCard.tsx       # Card reutilizável: ícone, valor, label, badge opcional, sparkline opcional
        ComplianceBadge.tsx  # Pill de conformidade (NR-1, Lei 14.457/22, ISO 37002)
```

---

## 9. Paleta resumida (referência rápida)

| Uso              | Todo o sistema (Hero unificado)     |
|------------------|--------------------------------------|
| Primário / CTA   | slate-900, slate-800 hover           |
| Fundo            | slate-50, white, app-bg gradient    |
| Destaque / ícones| violet-500, violet-100, violet-600   |
| Sucesso          | emerald-500, emerald-50, emerald-700|
| Atenção          | amber-500, amber-50, amber-700      |
| Risco            | red-500 / #EF4444                   |
| Texto principal  | slate-900                           |
| Texto secundário | slate-500, slate-600                 |
| Bordas           | slate-200, slate-200/60             |

---

## 10. Checklist para novas telas/componentes

- [ ] Textos em português do Brasil.
- [ ] Usar a identidade unificada: **slate (primário), violet (destaque), emerald/amber/red (estado)**.
- [ ] Botões e links com `aria-label` quando o texto visível não for suficiente.
- [ ] Motion com `import { motion } from "motion/react"`.
- [ ] Nomes de marca via `getAppName()` / `getProductName()` quando aplicável.
- [ ] Gráficos com cores condicionais (emerald/amber/red) e container acessível (`role="img"` + `aria-label`).
- [ ] Códigos/protocolos com `font-mono` e `tracking-widest`.
- [ ] Respeitar `prefers-reduced-motion` onde houver animações de hover/entrada.

Use este documento como contexto ao pedir novas páginas, componentes ou ajustes visuais para manter o **mesmo padrão** em todo o sistema.

---

## 11. Área administrativa (painel pós-login)

- **Layout:** Quando `view === 'admin'`, o App renderiza apenas `AdminLayout` (sem header público). Dentro do layout: Sidebar (desktop) + bottom nav (mobile) + **AdminHeader** (título da página + pesquisa) + conteúdo. Modelo em `docs/PROMPT-RESUMO-SIDEBAR-LOGIN-PERFIL.md`.
- **Contexto detalhado:** Ver **`docs/ADMIN-CONTEXT.md`** para estrutura de pastas, destinos (`AdminPage`: dashboard, empresas, perfil), segurança (role admin, RLS), fluxo de logout, perfil, módulo Empresas (cnpj, nicho, setores) e checklist.
- **Componentes:** `src/components/admin/` — `AdminLayout`, `AdminSidebar`, `AdminHeader`, `AdminPerfil`, `AdminEmpresas`. Dashboard em `AdminDashboard.tsx` com `hideHeaderActions` quando usado dentro do layout.
- **Regra Cursor:** Ao trabalhar na área admin, consultar sempre `docs/ADMIN-CONTEXT.md` e este `DESIGN_CONTEXT.md`.
