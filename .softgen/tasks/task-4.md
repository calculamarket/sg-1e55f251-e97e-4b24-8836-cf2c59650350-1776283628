---
title: Criar página de pedidos com listagem e filtros
status: done
priority: high
type: feature
tags: [orders, table, filters]
created_by: agent
created_at: 2026-04-15T18:42:14Z
position: 4
---

## Notes
Página dedicada para visualizar todos os pedidos dos marketplaces com opções de filtro por período, marketplace, status. Tabela responsiva com paginação. Incluir modal ou página de detalhes do pedido.

## Checklist
- [x] Criar página src/pages/orders.tsx com layout
- [x] Criar componente OrdersTable: tabela com colunas ID, marketplace, cliente, produto, valor, status, data
- [x] Adicionar filtros: marketplace (todos/ML/Shopee), status (todos/pendente/pago/enviado/entregue), período
- [x] Implementar paginação
- [x] Criar modal/drawer de detalhes do pedido
- [x] Adicionar badges coloridos para status
- [x] Adicionar ícones de marketplace