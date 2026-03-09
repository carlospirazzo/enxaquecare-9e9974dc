

## Plano: Limitar observações a 5 palavras e exibi-las no resumo mensal

### Alterações

1. **`src/components/EpisodeForm.tsx`** — Adicionar validação no campo "Observações" limitando a 5 palavras (bloquear digitação além do limite ou exibir contador/aviso).

2. **`src/components/MonthlySummary.tsx`** — Adicionar nova seção "Observações" ao final do resumo, listando cronologicamente os episódios que possuem notas preenchidas, com a data formatada e o texto da observação.

### Detalhes técnicos

- Validação por contagem de palavras via `value.trim().split(/\s+/).length` no `onChange` do `Textarea` (ou substituir por `Input` já que serão textos curtos).
- No resumo, filtrar `episodes.filter(e => e.notes.trim())`, ordenar por data e renderizar com ícone de `StickyNote` e data formatada em pt-BR.

