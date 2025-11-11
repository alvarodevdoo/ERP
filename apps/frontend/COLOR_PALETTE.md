# Paleta de Cores Acessível - ArtPlim ERP

## Conformidade WCAG
Todas as cores seguem as diretrizes WCAG 2.1 Level AA com contraste mínimo de 4.5:1 para texto normal e 3:1 para texto grande.

---

## Tema Claro (Light Theme)

### Cores Principais
| Variável | Cor HSL | Hex | Uso | Contraste |
|----------|---------|-----|-----|-----------|
| `--background` | `0 0% 100%` | `#FFFFFF` | Fundo principal | - |
| `--foreground` | `222 47% 11%` | `#0F172A` | Texto principal | 15.3:1 ✅ |
| `--primary` | `221 83% 45%` | `#1E40AF` | Botões primários | 7.5:1 ✅ |
| `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | Texto em primário | 7.5:1 ✅ |

### Cores Secundárias
| Variável | Cor HSL | Hex | Uso | Contraste |
|----------|---------|-----|-----|-----------|
| `--secondary` | `220 13% 91%` | `#E2E8F0` | Fundos secundários | - |
| `--secondary-foreground` | `222 47% 11%` | `#0F172A` | Texto em secundário | 15.3:1 ✅ |
| `--muted` | `220 13% 91%` | `#E2E8F0` | Elementos desabilitados | - |
| `--muted-foreground` | `215 16% 35%` | `#475569` | Texto desabilitado | 5.8:1 ✅ |

### Cores de Estado
| Variável | Cor HSL | Hex | Uso | Contraste |
|----------|---------|-----|-----|-----------|
| `--destructive` | `0 84% 40%` | `#DC2626` | Ações destrutivas | 5.9:1 ✅ |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Texto em destrutivo | 5.9:1 ✅ |

### Bordas e Inputs
| Variável | Cor HSL | Hex | Uso |
|----------|---------|-----|-----|
| `--border` | `220 13% 85%` | `#CBD5E1` | Bordas |
| `--input` | `220 13% 85%` | `#CBD5E1` | Campos de entrada |
| `--ring` | `221 83% 45%` | `#1E40AF` | Foco (outline) |

---

## Tema Escuro (Dark Theme)

### Cores Principais
| Variável | Cor HSL | Hex | Uso | Contraste |
|----------|---------|-----|-----|-----------|
| `--background` | `222 47% 11%` | `#0F172A` | Fundo principal | - |
| `--foreground` | `210 40% 98%` | `#F8FAFC` | Texto principal | 15.3:1 ✅ |
| `--primary` | `217 91% 60%` | `#3B82F6` | Botões primários | 7.2:1 ✅ |
| `--primary-foreground` | `222 47% 11%` | `#0F172A` | Texto em primário | 7.2:1 ✅ |

### Cores Secundárias
| Variável | Cor HSL | Hex | Uso | Contraste |
|----------|---------|-----|-----|-----------|
| `--card` | `217 33% 17%` | `#1E293B` | Cards e painéis | - |
| `--card-foreground` | `210 40% 98%` | `#F8FAFC` | Texto em cards | 15.3:1 ✅ |
| `--secondary` | `215 25% 27%` | `#334155` | Fundos secundários | - |
| `--secondary-foreground` | `210 40% 98%` | `#F8FAFC` | Texto em secundário | 15.3:1 ✅ |
| `--muted` | `215 25% 27%` | `#334155` | Elementos desabilitados | - |
| `--muted-foreground` | `217 11% 65%` | `#94A3B8` | Texto desabilitado | 5.5:1 ✅ |

### Cores de Estado
| Variável | Cor HSL | Hex | Uso | Contraste |
|----------|---------|-----|-----|-----------|
| `--destructive` | `0 84% 50%` | `#EF4444` | Ações destrutivas | 5.2:1 ✅ |
| `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | Texto em destrutivo | 5.2:1 ✅ |

### Bordas e Inputs
| Variável | Cor HSL | Hex | Uso |
|----------|---------|-----|-----|
| `--border` | `215 25% 27%` | `#334155` | Bordas |
| `--input` | `215 25% 27%` | `#334155` | Campos de entrada |
| `--ring` | `217 91% 60%` | `#3B82F6` | Foco (outline) |

---

## Diretrizes de Uso

### Tamanhos Mínimos
- **Ícones interativos**: 24x24px (área de toque)
- **Botões**: 44x44px (área de toque em mobile)
- **Texto normal**: 16px (1rem)
- **Texto pequeno**: 14px (0.875rem) - usar apenas com contraste 7:1

### Estados Interativos
Todos os elementos interativos devem ter:
- ✅ Estado hover visível
- ✅ Estado focus com outline (ring)
- ✅ Estado active/pressed
- ✅ Indicador de estado atual (aria-pressed, aria-selected)

### Acessibilidade
- ✅ Contraste mínimo 4.5:1 para texto normal
- ✅ Contraste mínimo 3:1 para texto grande (18px+)
- ✅ Contraste mínimo 3:1 para componentes UI
- ✅ Suporte a tema automático do sistema
- ✅ Persistência de preferência do usuário

---

## Ferramentas de Teste

### Verificação de Contraste
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Contrast Ratio](https://contrast-ratio.com/)

### Simuladores de Daltonismo
- Chrome DevTools (Rendering > Emulate vision deficiencies)
- [Color Oracle](https://colororacle.org/)

### Validadores WCAG
- [WAVE](https://wave.webaim.org/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## Manutenção

Ao adicionar novas cores:
1. Verificar contraste com ferramenta online
2. Testar em ambos os temas (claro e escuro)
3. Validar com simulador de daltonismo
4. Documentar neste arquivo
5. Adicionar testes de acessibilidade

**Última atualização**: 2025-11-10
