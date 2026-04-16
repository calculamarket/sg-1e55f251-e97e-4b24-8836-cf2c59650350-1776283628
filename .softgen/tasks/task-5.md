---
title: Implementar temas claro e escuro com toggle
status: in_progress
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
- [ ] Configurar variáveis CSS de tema claro e escuro em globals.css usando :root e .dark
- [ ] Garantir que o Tailwind esteja com darkMode="class" em tailwind.config.ts
- [ ] Ajustar ThemeProvider para gerenciar tema (light/dark/system) com persistência
- [ ] Integrar ThemeSwitch ao ThemeProvider, usando ícones claros e estados acessíveis
- [ ] Validar que todas as principais páginas (dashboard, pedidos, configurações, auth) respeitam o tema