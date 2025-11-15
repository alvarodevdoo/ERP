# Guia de Temas (Claro/Escuro)

Este projeto usa variáveis CSS e Tailwind para suportar temas claro e escuro com alta acessibilidade.

## Como os temas funcionam

- As variáveis CSS são definidas em `src/index.css` dentro de `@layer base`.
- O Tailwind foi configurado para ler essas variáveis em `tailwind.config.js` (cores `background`, `foreground`, `primary`, `secondary`, `success`, `warning`, `info`, `destructive`, etc.).
- O tema ativo é aplicado adicionando uma classe ao elemento `html` (documentElement).

### Classes e seletores suportados

- `light`, `theme-light`, `[data-theme="light"]`: força tema claro
- `dark`, `theme-dark`, `[data-theme="dark"]`: força tema escuro
- Fallback automático: se nenhuma classe for aplicada, usamos `@media (prefers-color-scheme: dark)` para aplicar as variáveis escuras.

## Hook de tema

O hook `src/hooks/useTheme.ts` controla a preferência do usuário e sincroniza com o sistema:

```ts
type Theme = 'light' | 'dark' | 'system'
// setTheme('light' | 'dark' | 'system')
```

Quando `system` é selecionado, o hook detecta `prefers-color-scheme` e aplica `light` ou `dark` automaticamente.

## Boas práticas de uso

- Para cores do fundo e texto, prefira utilitários Tailwind baseados em tokens: `bg-background`, `text-foreground`, `border-border`.
- Para ações primárias: `bg-primary text-primary-foreground hover:brightness-98 focus-visible:outline-ring`.
- Para estados semânticos: `bg-success`, `bg-warning`, `bg-info`, `bg-destructive` com seus respectivos `*-foreground`.
- Evite hex fixos em componentes. Se precisar de novas cores, acrescente variáveis e documente aqui.

## Acessibilidade

- `index.css` padroniza foco (`outline`), tamanhos mínimos de alvo e reduz movimento quando o usuário prefere.
- Utilize `aria-*` corretamente (`aria-pressed`, `aria-selected`) para refletir estados.

## Captura de screenshots

1. Rode `npm run dev` na pasta `apps/frontend`.
2. Abra o preview em `http://localhost:5173/`.
3. Capture telas do Dashboard e Produtos em ambos temas.
4. Compare antes/depois focando legibilidade de texto, contraste de cards e estados de alerta.

---

Atualizado em: 2025-11-11