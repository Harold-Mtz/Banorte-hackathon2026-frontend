# Banorte Boreas: contexto y objetivo

## Producto

Boreas es una experiencia financiera adaptativa para web responsive. El usuario expresa una necesidad en lenguaje natural y el backend devuelve una interfaz estructurada, no HTML ni JSX.

La propuesta no debe sentirse como un chat que responde texto. El chat es la entrada; el producto principal es un dashboard vivo que muestra contexto, decisiones, progreso y consecuencias.

## Objetivo del hackathon

Entregar una demo estable, clara y defendible que muestre:

- Login real y logout.
- Perfil financiero y flujo de caja visible.
- Planes con progreso y acciones.
- Registro de ingresos, aportaciones, gastos y retiros.
- Alertas antes de movimientos que comprometan una meta o el flujo mensual.
- Opciones de crédito basadas en productos reales del catálogo.
- UI adaptativa generada por el agente/MCP según la intención.

## Principios

1. PostgreSQL es la fuente de verdad de datos financieros.
2. El frontend no inventa perfil, saldos, productos ni aprobaciones.
3. Las tools de dominio son la frontera para consultar y mutar datos.
4. El backend devuelve un catálogo cerrado de componentes.
5. Toda acción persistente requiere confirmación y deja registro.
6. Un monto de ejemplo solo puede existir en mock mode y debe estar identificado como demo.
7. Las estimaciones se etiquetan como estimaciones; nunca como aprobación.

## Estado actual

- Frontend React + TypeScript + Vite en `Banorte-hackathon2026-frontend`.
- Backend Express + TypeScript + PostgreSQL en `Banorte-hackathon-backend`.
- Auth JWT funcionando.
- Agent API: `POST /api/agent/message` y `POST /api/agent/interact`.
- MCP HTTP en `/mcp`; las tools existentes deben ser registradas y reutilizadas por el agente.
- El renderer dinámico central es `src/AdaptiveRenderer.tsx` en frontend.

## Riesgo conocido

El backend tiene un `AgentService` temporal que todavía contiene ramas de UI y debe evolucionar a un orquestador basado en tools. Los cambios nuevos deben conservar contratos y permitir rollback por vertical slice.
