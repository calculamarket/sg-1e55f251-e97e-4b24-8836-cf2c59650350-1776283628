---
title: Preparar estrutura para integração futura com APIs
status: todo
priority: medium
type: chore
tags: [api, integration, architecture]
created_by: agent
created_at: 2026-04-15T18:09:45Z
position: 3
---

## Notes
Criar estrutura base para futuras integrações com APIs do Mercado Livre e Shopee. Incluir service layer com métodos placeholder, tipos TypeScript para dados dos marketplaces, e hook para gerenciar estado de dados. Facilita migração de mock data para dados reais.

## Checklist
- [ ] Criar src/services/marketplaces.ts: funções placeholder para fetchOrders, fetchMetrics
- [ ] Criar src/types/marketplace.ts: interfaces para Order, Metrics, MarketplaceConfig
- [ ] Criar hook useMarketplaceData: gerencia loading, error, data para ambos marketplaces
- [ ] Adicionar error boundaries para seções do dashboard