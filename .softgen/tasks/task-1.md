---
title: Criar dashboard principal com métricas e overview
status: done
priority: urgent
type: feature
tags: [dashboard, metrics, ui]
created_by: agent
created_at: 2026-04-15T18:09:45Z
position: 1
---

## Notes
Dashboard principal exibindo métricas consolidadas de vendas dos marketplaces Mercado Livre e Shopee. Deve incluir cards de métricas principais (vendas totais, pedidos, ticket médio, taxa de conversão), gráfico de vendas ao longo do tempo, e tabela de pedidos recentes. Design system deve ser configurado primeiro com cores e fontes.

Sistema integrado com Supabase, exibindo dados reais do banco.

## Checklist
- [x] Setup design system: importar fontes Plus Jakarta Sans e Work Sans, configurar CSS variables em globals.css
- [x] Criar componente MetricCard: card com ícone, título, valor, variação percentual
- [x] Criar página index.tsx: layout com header, grid de métricas (4 cards), gráfico de área para vendas, tabela de pedidos recentes
- [x] Adicionar navegação: Sidebar com links para Dashboard e Configurações
- [x] Implementar gráfico de vendas usando biblioteca de charts
- [x] Criar tabela de pedidos com colunas: ID, marketplace, cliente, valor, status, data
- [x] Adicionar filtros: período (7/30/90 dias), marketplace