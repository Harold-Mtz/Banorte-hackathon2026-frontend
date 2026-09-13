# Arquitectura y contratos

## Flujo canónico

```text
Login -> JWT -> Agent API -> Intent + domain tools -> AdaptiveUIResponse -> AdaptiveRenderer
                                           |
                                           +-> PostgreSQL
```

El navegador solo llama al agente para decisiones adaptativas. No llama directamente a Gemini, MCP ni repositorios.

## Request de mensaje

```json
{
  "message": "Quiero ahorrar para un viaje",
  "sessionId": "uuid-opcional"
}
```

`userId` puede mantenerse temporalmente para compatibilidad, pero el backend debe preferir `sub` del JWT.

## Request de interacción

```json
{
  "sessionId": "uuid",
  "componentId": "goal-1",
  "action": "RECORD_FINANCIAL_MOVEMENT",
  "payload": {
    "type": "DEPOSIT",
    "amount": 1500,
    "goalId": "uuid",
    "note": "Aportacion quincenal"
  }
}
```

## Response

```ts
type AdaptiveUIResponse = {
  sessionId: string;
  message?: string;
  intent?: string;
  components: AdaptiveComponent[];
  metadata?: Record<string, unknown>;
};

type AdaptiveComponent = {
  id: string;
  type: ComponentType;
  title?: string;
  description?: string;
  data: Record<string, unknown>;
};
```

## Componentes objetivo

- `financial-dashboard`: ingresos, gastos, disponible, ahorro, deuda y periodo.
- `goal-dashboard`: progreso, ritmo, fecha estimada, aportación y acciones.
- `cashflow-alert`: advertencia y consecuencias estimadas.
- `activity-list`: movimientos recientes.
- `credit-options`: productos y capacidad exploratoria.
- `financial-summary`
- `mortgage-capacity`
- `mortgage-simulator`
- `product-comparison`
- `savings-goal-form`
- `confirmation`
- `goal-progress`

## Acciones objetivo

- `REFRESH_DASHBOARD`
- `RECORD_FINANCIAL_MOVEMENT`
- `REQUEST_CREATE_SAVINGS_GOAL`
- `CONFIRM_CREATE_SAVINGS_GOAL`
- `UPDATE_MORTGAGE_SIMULATION`
- `REQUEST_CREDIT_OPTIONS`
- `CANCEL`
