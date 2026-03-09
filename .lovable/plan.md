

## Plano: Gatilhos de Enxaqueca + Relatório Comparativo

### 1. Modelo de dados (`src/types/migraine.ts`)
- Adicionar array `COMMON_TRIGGERS` com os 12 gatilhos: sono ruim, estresse, álcool, menstruação, café, jejum, mudança de clima, luz forte, cheiro forte, exercício, desidratação, barulho excessivo
- Adicionar campo `triggers: string[]` ao `MigraineEpisode`

### 2. Formulário (`src/components/EpisodeForm.tsx`)
- Adicionar seção colapsável "Gatilhos" (usando Collapsible) com chips selecionáveis, mesmo padrão dos sintomas
- Adicionar estado `triggers` e incluir no `handleSave`
- Limitar observações a 5 palavras

### 3. Resumo mensal (`src/components/MonthlySummary.tsx`)
- Adicionar seção "Top 3 Gatilhos" mostrando os 3 gatilhos mais frequentes com percentual (ocorrências/total de episódios × 100%)
- Listar observações do mês abaixo

### 4. Página de Relatório (`src/pages/Report.tsx`) — nova
- Toggle 3/6 meses
- Gráfico de barras empilhadas (recharts) com crises por mês
- Seções: visão geral, medicações, sintomas, gatilhos (todos com contagem e %), correlação menstrual, observações
- Botão "Exportar PDF" via `window.print()`

### 5. Rota e navegação
- **`src/App.tsx`**: adicionar rota `/relatorio`
- **`src/pages/Index.tsx`**: botão "Relatório" no header

### 6. Store (`src/hooks/useMigraineStore.ts`)
- Adicionar `getPeriodsEpisodes(months: number)` para filtrar episódios dos últimos N meses

### 7. CSS (`src/index.css`)
- Regras `@media print` para exportação PDF limpa

### Arquivos criados/editados
| Arquivo | Ação |
|---|---|
| `src/types/migraine.ts` | Editar — triggers |
| `src/components/EpisodeForm.tsx` | Editar — seção gatilhos + limite observações |
| `src/components/MonthlySummary.tsx` | Editar — top 3 gatilhos + observações |
| `src/hooks/useMigraineStore.ts` | Editar — getPeriodsEpisodes |
| `src/pages/Report.tsx` | Criar — relatório comparativo |
| `src/App.tsx` | Editar — rota |
| `src/pages/Index.tsx` | Editar — link relatório |
| `src/index.css` | Editar — @media print |

