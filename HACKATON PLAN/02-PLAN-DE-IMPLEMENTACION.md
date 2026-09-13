# Plan de implementación

## Vertical 1: dashboard vivo

- Agregar entidad de movimientos financieros.
- Exponer consulta agregada por usuario y periodo.
- Incluir metas activas y movimientos recientes.
- Renderizar dashboard desde respuesta del agente.

## Vertical 2: acciones de plan

- Aportar dinero a una meta.
- Registrar gasto/ingreso/retiro.
- Actualizar progreso desde movimientos persistidos.
- Confirmar acciones sensibles.

## Vertical 3: prevención

Antes de persistir un gasto o retiro, calcular:

- Disponible posterior.
- Diferencia contra aportación mensual.
- Si la meta se retrasaría.
- Si existe riesgo de saldo mensual negativo.

La advertencia no bloquea por defecto; requiere confirmación explícita.

## Vertical 4: crédito

- Consultar productos reales.
- Comparar tasa, CAT, monto y plazo.
- Mostrar capacidad como estimación.
- Nunca presentar preaprobación si no existe esa decisión de dominio.

## Orden recomendado

1. Contratos y migración SQL.
2. Repositorio/servicio de movimientos.
3. MCP tools de dashboard y movimientos.
4. AgentService que componga componentes con tools.
5. Renderer y controles.
6. Tests de integración y demo.

## Criterio de done

La demo permite iniciar sesión, pedir un dashboard, crear/seguir una meta, registrar una aportación, registrar un gasto extraordinario, ver la advertencia y revisar el impacto sin recargar datos inventados.
