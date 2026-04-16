---
title: Implementar temas claro e escuro com toggle
status: done
priority: medium
type: feature
tags: [theme, ui, dark-mode]
created_by: agent
created_at: 2026-04-16T16:47:22Z
position: 5
---

## Notes
Adicionar suporte a tema claro e escuro no dashboard, usando Tailwind + CSS variables + ThemeProvider existente. O usuário deve poder alternar o tema via botão (ThemeSwitch) e a preferência deve ser persistida (localStorage), respeitando também o tema do sistema na primeira carga.

## Checklist
- [x] Configurar variáveis CSS de tema claro e escuro em globals.css usando :root e .dark
- [x] Garantir que o Tailwind esteja com darkMode="class" em tailwind.config.ts
- [x] Ajustar ThemeProvider para gerenciar tema (light/dark/system) com persistência
- [x] Integrar ThemeSwitch ao ThemeProvider, usando ícones claros e estados acessíveis
- [x] Validar que todas as principais páginas (dashboard, pedidos, configurações, auth) respeitam o tema