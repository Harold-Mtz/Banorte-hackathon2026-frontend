# Master prompt para agentes futuros

Trabaja en el proyecto Banorte Boreas del hackathon Monterrey.

Lee primero todos los MD de `HACKATON PLAN`, `FRONTEND_HANDOFF.md` y `aahhhhh.MD`. Hay dos repos: frontend React/Vite/TypeScript y backend Express/TypeScript/PostgreSQL. Respeta los límites: navegador -> Agent API; Agent API -> servicios/tools/MCP; servicios -> repositorios/PostgreSQL.

No conviertas el producto en un chat genérico. El mensaje es la entrada y la interfaz adaptativa es el producto. Mantén un catálogo cerrado de componentes y no uses HTML arbitrario del modelo.

Prioridades:

1. No hardcodear datos financieros, productos, saldos, metas o aprobaciones.
2. Usar las tools de dominio para construir dashboard, metas, movimientos, alertas y crédito.
3. Mantener JWT, login, logout y autorización por `sub`.
4. Toda mutación financiera debe persistirse, validarse y confirmarse.
5. Antes de gastos/retiros, mostrar impacto proyectado y pedir confirmación.
6. Mantener mocks únicamente como fallback explícito.
7. Cambiar poco, compilar ambos repos y probar un flujo punta a punta.
8. No hacer commits destructivos ni revertir cambios ajenos.

Al terminar reporta archivos, migraciones pendientes, comandos de prueba y cualquier limitación real.
