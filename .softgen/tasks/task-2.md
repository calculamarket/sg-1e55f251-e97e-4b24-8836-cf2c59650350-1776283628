---
title: Criar página de configurações de API
status: done
priority: high
type: feature
tags: [settings, api, forms]
created_by: agent
created_at: 2026-04-15T18:09:45Z
position: 2
---

## Notes
Página de configurações onde usuário pode inserir e salvar credenciais de API do Mercado Livre e Shopee. Cada marketplace terá seu próprio card com formulário. Incluir validação básica e feedback visual ao salvar. Credenciais serão armazenadas em localStorage até backend estar disponível.

## Checklist
- [x] Criar página src/pages/settings.tsx: layout com tabs ou cards separados por marketplace
- [x] Criar formulário Mercado Livre: campos para Client ID, Client Secret, Access Token
- [x] Criar formulário Shopee: campos para Partner ID, Partner Key, Shop ID
- [x] Adicionar validação: campos obrigatórios, formato básico
- [x] Implementar save/load das credenciais em localStorage
- [x] Adicionar feedback visual: toast de sucesso ao salvar, indicador de status (configurado/não configurado)