# Contratos verificados en el backend

Todas las rutas REST usan `{ success: true, data, message? }` o `{ success: false, error: { code, message, details? } }`. Fechas JSON son strings. Importes son números MXN; tasas están en puntos porcentuales.

| Uso | Método y ruta | Contrato |
|---|---|---|
| Login | POST /api/auth/login | email, password → token, user {id,name,email} |
| Registro (añadido) | POST /api/auth/register | name, email, password (8–72 bytes) → mismo resultado que login; crea perfil inicial en transacción |
| Usuario | GET /api/users/:id | User; no hay edición de cuenta |
| Perfil | GET/PATCH /api/financial-profiles/:userId/financial-profile | monthlyIncome, monthlyExpenses, currentSavings, currentDebt, creditScore (300–850, opcional) |
| Resumen | GET /api/financial-profiles/:userId/financial-summary | perfil + availableIncome calculado por servidor |
| Experiencias | GET /api/life-events/user/:userId; POST /api/life-events | userId, type, title, context? |
| Metas | GET /api/savings-goals/user/:userId; POST /api/savings-goals | userId, lifeEventId?, name, targetAmount, currentAmount?, monthlyContribution?, targetDate? |
| Progreso | GET /api/savings-goals/:id/progress; PATCH /api/savings-goals/:id/amount | {goalId,progress}; {currentAmount} → SavingsGoal |
| Productos | GET /api/financial-products?type=MORTGAGE | FinancialProduct[]; interestRate, cat, minimumTermMonths, maximumTermMonths |
| Simulación | POST /api/mortgages/simulate | userId, lifeEventId?, financialProductId, propertyValue, downPayment, termMonths |
| Historial | GET /api/users/:userId/mortgage-simulations | MortgageSimulation[] |
| Agente | POST /api/agent/message | userId, sessionId?, message → AgentResponse |
| Interactuar (añadido) | POST /api/agent/interact | sessionId, componentId, action, payload? → AgentResponse |
| Recuperación | GET /api/agent/sessions/:sessionId/ui-states/latest | UIState {schema: AdaptiveUIResponse,...} |

AgentResponse conserva `{sessionId,message?,intent?,ui:{version:'1.0',screen:{title,subtitle?},components:[{id,type,props,actions?}]}}`. No se normaliza a un contrato inventado.

Registro, persistencia del agente y procesamiento de interacciones faltaban en el código original. Se añaden sobre servicios, repositorios y tablas existentes. Acciones permitidas: UPDATE_DOWN_PAYMENT, REQUEST_CREATE_SAVINGS_GOAL, CONFIRM_CREATE_SAVINGS_GOAL, CANCEL. La confirmación toma datos pendientes del servidor. Los otros eventos se registran y muestran su estado, sin simular experiencias especializadas.

No hay movimientos financieros ni series temporales de saldos: la actividad muestra únicamente experiencias y simulaciones reales. No hay endpoint para editar nombre/email o cancelar experiencias/metas; no se muestran controles ficticios.
