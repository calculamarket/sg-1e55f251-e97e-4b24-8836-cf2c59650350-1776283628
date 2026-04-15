---
title: Criar página de configurações de API
status: done
priority: high
type: feature
tags: [settings, api, configuration]
created_by: agent
created_at: 2026-04-15T18:09:45Z
position: 2
---

## Notes
Página para gerenciar credenciais de API do Mercado Livre e Shopee. Armazenamento seguro no Supabase com RLS. Incluir validação, feedback visual e botões de sincronização para testar as integrações.

## Checklist
- [x] Criar página settings.tsx com formulários para ambas plataformas
- [x] Mercado Livre: campos Client ID, Client Secret, Access Token, Refresh Token
- [x] Shopee: campos Partner ID, Partner Key, Shop ID, Access Token
- [x] Salvar credenciais no Supabase de forma segura
- [x] Adicionar validação nos campos obrigatórios
- [x] Adicionar feedback visual: toast de sucesso ao salvar, indicador de status (configurado/não configurado)
- [x] Implementar botões de sincronização individual e geral