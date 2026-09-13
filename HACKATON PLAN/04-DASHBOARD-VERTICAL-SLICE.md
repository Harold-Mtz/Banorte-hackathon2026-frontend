# Dashboard: vertical completa

## Contrato

Flujo: usuario → frontend → Agent API autenticada → AgentService → tools de dominio compartidas con MCP → servicios → repositorios → PostgreSQL → respuesta UI completa → AdaptiveRenderer.

La API devuelve `{ success, data: { sessionId, intent, message, ui: { components } } }`. Cada componente del backend usa `props`; el adapter lo convierte a `data`. También acepta respuestas AdaptiveUIResponse directas o envueltas en `success/data`.

Las entradas y los datos de cada componente conocido se validan con Zod. Los componentes desconocidos muestran un fallback seguro. React escapa los textos. Los nombres de acciones se validan contra un enum cerrado.

## Confirmaciones y concurrencia

Todos los movimientos y cambios de meta se preparan primero. La respuesta incluye un componente de confirmación cuyo ID aleatorio identifica el pendiente guardado en la sesión de PostgreSQL.

El cliente confirma con ese ID y la acción. El servidor obtiene los valores del pendiente, ignorando montos reenviados por el cliente. Al confirmar se bloquea la fila del usuario y se ejecutan movimiento, saldo de meta, recibo de confirmación e historial en una sola transacción. Confirmaciones repetidas no duplican operaciones. Las confirmaciones vencen después de 15 minutos.

Si cambian los datos desde la vista previa, el servidor crea una nueva confirmación con el impacto actualizado. Cancelar descarta el pendiente. Una conversación nueva no elimina recursos financieros.

## Cálculos de la demo

- Ingresos y gastos mensuales: base del perfil más movimientos del mes calendario de Ciudad de México.
- Ahorro: base del perfil más depósitos acumulados menos retiros acumulados.
- Disponible: ingreso mensual menos gasto mensual, deuda mensual y retiros del mes.
- `current_debt` conserva la interpretación histórica del servicio como pago mensual de deuda; no hay un segundo campo para saldo total de créditos.
- Un depósito registra dinero que entra al ahorro; no se cuenta también como ingreso mensual. La meta opcional recibe ese mismo aporte. Un retiro asociado reduce el saldo de la meta.
- Advertencias: disponible negativo, movimiento mayor al 25% del gasto mensual o falta de fondos para aportaciones planeadas.
- El retraso es una estimación de aportaciones faltantes. Se distribuye el faltante del periodo proporcionalmente entre las metas activas. No se supone que un gasto aislado se repita cada mes.
- Tasas y CAT del catálogo usan puntos porcentuales: 10.5 significa 10.5%. La mensualidad hipotecaria usa esa tasa dividida entre 100 y entre 12.
- No se inventan montos objetivo, fechas, productos, mensualidades ni aprobaciones.

## Persistencia

`financial_movements` conserva usuario, meta opcional, tipo, monto, categoría, nota, fecha y creación. `goal_audit` registra cambios de meta y saldos mediante trigger. Las metas se eliminan lógicamente y conservan movimientos y auditoría. No se permite eliminar una meta con saldo.

Metas: ACTIVE, COMPLETED, PAUSED, CANCELLED, ARCHIVED y DELETED. Los depósitos y retiros de metas requieren estado ACTIVE o COMPLETED.

## Seguridad

El JWT aporta el usuario efectivo mediante `sub`. Las sesiones, metas y eventos relacionados se verifican antes de usarse. El HTTP MCP también exige JWT y sustituye cualquier userId recibido por el sujeto autenticado.

Las rutas antiguas de acceso directo a repositorios no se montan en la app; su código se conserva para una futura revisión. Rutas activas: health, auth/login, agent/message, agent/interact y MCP.

## Verificación

Backend: 46 comprobaciones de integración contra PostgreSQL. Frontend: 8 pruebas de contrato/renderizado, incluyendo respuestas reales de las pruebas de API. Login del seed y dashboard validados a través del adapter real.

Pendiente de revisión manual: interacción visual en navegador y tamaños 360, 768 y escritorio. El entorno no tenía un navegador conectado.
