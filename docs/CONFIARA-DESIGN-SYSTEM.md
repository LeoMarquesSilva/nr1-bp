# CONFIARA Design System

Este documento consolida a base de UI aplicada no projeto para manter consistência e escalabilidade.

## 1) Design Tokens (CSS Variables)

Os tokens estão em `src/style.css`:

- Brand scale 50-900:
  - `--color-brand-50` ... `--color-brand-900`
  - Núcleo da marca:
    - `#040c1e` (base escura)
    - `#122c4f` (primária)
    - `#5b88b2` (accent)
    - `#fbf9e4` (creme de contraste)
- Semânticos:
  - `--color-success-*`
  - `--color-warning-*`
  - `--color-error-*`
  - `--color-info-*`
- Superfície e estados:
  - `--background`, `--foreground`, `--border`, `--ring`, `--primary`, `--secondary`, `--danger`

## 2) Tipografia

- Família principal: `All Round Gothic` via `@font-face` em `src/style.css`
- **Leitura longa (formulários e páginas legais):** variável `--font-reading` (pilha `ui-sans-serif, system-ui, …`) e classe utilitária `.font-reading` em `src/style.css`. Usada no `PageShell` e no fluxo de denúncias para melhor legibilidade e cobertura de glifos (como no rodapé).
- Escala base:
  - `--text-h1`, `--text-h2`, `--text-h3`, `--text-h4`
  - `--text-body`, `--text-small`
- Aplicação:
  - `h1..h4` e classes utilitárias `.h1..h4`, `.body`, `.small`

## 3) Tailwind v4 Theme Mapping

O projeto usa Tailwind v4 com `@theme` no próprio `src/style.css`:

- `--color-brand-50` ... `--color-brand-900`
- `--font-sans: "All Round Gothic", ...`

Com isso, o tema fica centralizado em CSS (modelo recomendado no setup atual com Vite + Tailwind v4).

## 4) Componentes React (UI Core)

Camada base em `src/components/ui/`:

- `button.tsx`
  - Variantes: `primary`, `secondary`, `ghost`, `danger`
  - Compatibilidade: `default`, `destructive`
- `input.tsx`
  - Estados: default/focus/error/disabled (`hasError`)
- `card.tsx`
  - Variantes: `standard`, `kpi`, `analytics`
- `badge.tsx`
  - Variantes: `pending`, `resolved`, `critical`, `neutral`
- `table.tsx`
  - Estrutura: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- `modal.tsx`
  - Estrutura: `Modal`, `ModalContent`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalFooter`

## 5) PageShell (fluxo denúncia + páginas estáticas)

- **Arquivo:** `src/components/layout/PageShell.tsx`
- **Props:** `title`, `subtitle` (opcional), `onBack` / `backLabel`, `maxWidth` (`narrow` | `medium` | `wide`), `children`, `footer` (opcional).
- **`PageShellCard`:** card com faixa superior em `--color-brand-400`, gradiente claro (`from-white` → `brand-50`) e sombra; alinhado à identidade do hero.
- **Superfície pública:** classe `.flow-brand-surface` em `style.css` (wash de `--color-brand-700` + accent `--color-brand-400` no topo) aplicada ao wrapper principal em `App.tsx` (exceto admin).
- **Ícones em destaque:** classe `.brand-icon-tile` (fundo creme `--color-brand-cream` + anel accent) para ícones em cards do canal, Sobre e Privacidade.
- **Views que usam o shell (canal + institucional):** `RelatosBuscarEmpresa`, `CanalRelatosHub`, `WhistleblowerForm` (apenas `font-reading` + largura), `ConsultarDenuncia`, `WhistleblowerThanks`, `Sobre`, `Privacidade`.

## 6) Páginas-exemplo já migradas

- Dashboard/Admin (estrutura e estados visuais):
  - `src/components/admin/AdminLayout.tsx`
  - `src/components/admin/AdminSidebar.tsx`
  - `src/components/admin/AdminHeader.tsx`
  - `src/components/admin/AdminEmpresaDashboard.tsx`
- Fluxo de denúncia (wizard em etapas, tokens brand):
  - `src/components/WhistleblowerForm.tsx`
  - Dados e microcopy: `src/data/denunciaForm.ts`

## 7) Shell marketing (landing): hero full-bleed e header

- **Largura do hero:** Na view `landing`, o `<main>` em `src/App.tsx` **não** aplica padding horizontal nem superior (`px-0 pt-0 pb-0`), para o fundo `.landing-premium-bg` ir de borda a borda. O alinhamento do conteúdo continua no grid interno (`max-w-7xl` + `px` em `HeroSection`).
- **`HealthqoeHeader`:** Prop opcional `appearance: 'light' | 'dark'` (default `light`). Na landing, `App.tsx` passa `appearance="dark"`: fundo `brand-900` com blur, borda inferior `white/10`, logo horizontal **branco** (`Logo variant="dark"`), navegação e CTAs em tons claros; CTA primário usa **creme** (`--color-brand-cream`) como no hero. Demais views mantêm o header claro.
- **Canal de denúncias (mesmo gradiente da hero):** Em `App.tsx`, o bloco `denuncia-*` usa wrapper `bg-brand-900` + área `.denuncia-flow-canvas` com o **mesmo stack de gradientes** que `.landing-premium-bg`. Conteúdo em `.denuncia-glass-panel` (vidro claro) e faixas `.denuncia-glass-dark` no formulário. `PageShell` / `PageShellCard` aceitam `surface="onGradient"` (título e botão voltar em texto claro; cards em vidro).
- **Arquivos:** `src/style.css` (classes acima), `src/components/layout/header/header.tsx`, `nav-links.tsx`, `mobile-menu.tsx`, `App.tsx`, `PageShell.tsx`, `WhistleblowerForm.tsx`.

## 8) Referência de qualidade (S-Tier SaaS)

Princípios alinhados a produtos como Stripe / Linear / Airbnb: hierarquia clara, consistência de tokens, foco e acessibilidade (contraste WCAG em estados default/hover/focus no header escuro). Evoluções futuras: dark mode global, tabelas admin e módulos de configuração seguem o mesmo checklist.

## 9) Checklist manual (fluxo denúncia + páginas legais)

- **Viewport:** ~375px (mobile), tablet, desktop — barra de progresso do formulário e botões Voltar/Próximo não quebram o layout.
- **Contraste e foco:** `input-escritorio` e botões com anel `focus-visible` / `ring` visível em fundo claro.
- **Fluxo:** buscar organização → hub → formulário (todas as etapas) → obrigado → copiar protocolo (feedback inline) → consultar → voltar.
- **Conteúdo longo:** `Sobre` e `Privacidade` com scroll; um único `h1` por view via `PageShell` onde aplicável.

## 10) Próximos passos recomendados

1. Migrar componentes legados para usar `ui/*` de forma padronizada.
2. Substituir classes de cor hardcoded por tokens (`var(--...)`) em telas restantes.
3. Criar catálogo interno de componentes (storybook ou página de showcase).
