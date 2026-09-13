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

## Vertical 5: objetivos abiertos y ciclo de vida

- Reemplazar el supuesto de que toda intención desconocida es casa.
- Crear `GENERAL_GOAL` para perro, celular, computadora, mudanza, salud, viaje y otros.
- Implementar selector de metas activas.
- Implementar editar, pausar, reactivar, cancelar, archivar y eliminar lógicamente.
- Mantener movimientos e historial aunque una meta sea archivada o eliminada lógicamente.
- Mostrar checklist y próximos pasos configurables por categoría.
- Recalcular progreso, ritmo y fecha estimada después de cada movimiento.
- Mostrar impacto antes de confirmar gastos o retiros.

## Orden recomendado

1. Contratos e intención abierta.
2. Modelo y ciclo de vida de metas.
3. Repositorio/servicio de movimientos.
4. MCP tools de dashboard, metas y movimientos.
5. AgentService que componga componentes con tools.
6. Renderer y controles.
7. Tests de integración y demo.

## Criterio de done

La demo permite iniciar sesión, pedir un dashboard, crear/seleccionar/editar/pausar una meta genérica como “ahorrar para un celular” o “tener un perro”, registrar aportaciones y gastos, ver advertencias de impacto, confirmar movimientos y revisar el progreso sin datos inventados.
