# HANDOFF FRONTEND — Banorte Hackathon / Adaptive Life

> Documento para entregar a otro agente o desarrollador. El objetivo es poder construir el frontend completo mientras el backend termina la orquestación Gemini → MCP → Services → PostgreSQL.

---

## 1. Objetivo del frontend

Construir una experiencia financiera adaptativa en la que el usuario expresa una meta en lenguaje natural y el backend responde con una **descripción estructurada de interfaz**. El frontend **no decide el flujo financiero** y **no llama directamente a servicios financieros, Gemini ni MCP**.

La responsabilidad del frontend es:

```text
Usuario
  ↓
Frontend
  ↓ HTTP
Agent API
  ↓
AdaptiveUIResponse
  ↓
Dynamic UI Renderer
  ↓
Componentes React
  ↓
Interacción del usuario
  ↓ HTTP
Agent API
  ↓
Nueva AdaptiveUIResponse
```

El backend se encarga internamente de:

```text
Gemini → MCP Client → MCP Tools → Services → Repositories → PostgreSQL
```

Por lo tanto, no implementar lógica MCP en el navegador.

---

## 2. Stack recomendado

Este scaffold usa:

- React
- TypeScript
- Vite
- React Router
- Zod para validar respuestas dinámicas del backend
- CSS propio para minimizar dependencias durante el hackathon

No es necesario agregar Redux para el MVP. El estado principal es una sesión del agente y la respuesta UI actual.

Si el equipo ya tiene un design system, se pueden sustituir los componentes de `src/components/ui` sin cambiar los contratos.

---

## 3. Regla arquitectónica más importante

El frontend nunca debe hacer esto:

```text
React → /mortgage/simulate
React → /financial-profile
React → Gemini
React → MCP
```

El frontend debe hacer esto:

```text
React → POST /api/agent/message
React → POST /api/agent/interact
```

El agente del backend decide qué herramienta utilizar.

Esto permite que el demo muestre el valor real de una interfaz adaptativa controlada por un agente, en lugar de una colección de formularios fijos.

---

## 4. Endpoints que el frontend espera

### 4.1 Enviar mensaje

```http
POST /api/agent/message
Content-Type: application/json
```

Request temporal:

```json
{
  "userId": "UUID_DEL_USUARIO",
  "message": "Quiero comprar mi primera casa",
  "sessionId": "UUID_OPCIONAL"
}
```

- `userId`: requerido mientras no se obtenga desde JWT/session.
- `message`: requerido.
- `sessionId`: se omite en la primera petición y se reutiliza después.

Response esperado:

```json
{
  "sessionId": "session-123",
  "intent": "FIRST_HOME",
  "message": "Con tu perfil actual puedes explorar estas opciones.",
  "components": [
    {
      "id": "financial-summary-1",
      "type": "financial-summary",
      "title": "Tu panorama financiero",
      "data": {
        "monthlyIncome": 48000,
        "monthlyExpenses": 24500,
        "monthlyDebtPayments": 3500,
        "currentSavings": 310000,
        "availableMonthlyCash": 20000
      }
    }
  ]
}
```

### 4.2 Interacción sobre un componente

```http
POST /api/agent/interact
Content-Type: application/json
```

Request:

```json
{
  "userId": "UUID_DEL_USUARIO",
  "sessionId": "session-123",
  "componentId": "mortgage-simulator-1",
  "action": "UPDATE_MORTGAGE_SIMULATION",
  "payload": {
    "propertyValue": 2200000,
    "downPayment": 500000,
    "termMonths": 240,
    "productId": "mortgage-flex"
  }
}
```

Response: otro `AdaptiveUIResponse` completo.

**Recomendación para backend:** devolver siempre la pantalla/estado de UI completo, no patches parciales, durante el hackathon. Simplifica mucho sincronización y recuperación de errores.

---

## 5. Contrato `AdaptiveUIResponse`

Contrato TypeScript incluido en:

```text
src/types/adaptive-ui.ts
```

Forma base:

```ts
export type AdaptiveUIResponse = {
  sessionId: string;
  message?: string;
  intent?: string;
  components: AdaptiveComponent[];
  metadata?: Record<string, unknown>;
};
```

Cada componente:

```ts
export type AdaptiveComponent = {
  id: string;
  type: AdaptiveComponentType;
  title?: string;
  description?: string;
  data: Record<string, unknown>;
};
```

Tipos permitidos inicialmente:

```text
financial-summary
mortgage-capacity
mortgage-simulator
product-comparison
savings-goal-form
goal-progress
confirmation
```

No renderizar HTML arbitrario enviado por el LLM. La salida del modelo debe mapearse a un catálogo cerrado de componentes.

---

## 6. Component Registry / Dynamic Renderer

Archivo principal:

```text
src/components/adaptive/AdaptiveRenderer.tsx
```

Su trabajo es traducir:

```json
{
  "type": "mortgage-simulator",
  "data": { "...": "..." }
}
```

a:

```tsx
<MortgageSimulator ... />
```

El LLM nunca devuelve JSX. Solo devuelve JSON estructurado.

El renderer debe ignorar de manera segura cualquier tipo desconocido. Zod además valida que el backend solo use tipos aceptados.

---

## 7. Componentes disponibles en este scaffold

### `financial-summary`

Propósito: mostrar contexto financiero del usuario.

Data esperada:

```ts
{
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtPayments?: number;
  currentSavings: number;
  availableMonthlyCash?: number;
}
```

### `mortgage-capacity`

Propósito: mostrar estimación de capacidad de pago / vivienda.

```ts
{
  estimatedMaxPayment: number;
  estimatedPropertyValue?: number;
  affordabilityRatio?: number;
  note?: string;
}
```

### `mortgage-simulator`

Propósito: permitir cambiar valor, enganche y plazo.

```ts
{
  productId?: string;
  productName?: string;
  propertyValue: number;
  downPayment: number;
  termMonths: number;
  annualRate?: number;
  estimatedMonthlyPayment?: number;
  minDownPayment?: number;
  maxDownPayment?: number;
}
```

Al presionar recalcular envía:

```text
UPDATE_MORTGAGE_SIMULATION
```

Payload:

```json
{
  "propertyValue": 2200000,
  "downPayment": 500000,
  "termMonths": 240,
  "productId": "..."
}
```

### `product-comparison`

Propósito: comparar productos disponibles.

```ts
{
  products: Array<{
    id: string;
    name: string;
    annualRate?: number;
    cat?: number;
    maxTermMonths?: number;
    minDownPaymentPercent?: number;
    monthlyPayment?: number;
    highlighted?: boolean;
    description?: string;
  }>;
}
```

### `savings-goal-form`

Propósito: capturar una meta propuesta por el agente.

```ts
{
  title?: string;
  targetAmount: number;
  targetDate?: string;
  initialAmount?: number;
  suggestedMonthlyContribution?: number;
  lifeEvent?: string;
}
```

Al continuar envía:

```text
REQUEST_CREATE_SAVINGS_GOAL
```

El backend debería contestar primero con `confirmation`, no guardar directamente.

### `confirmation`

Propósito: confirmar una acción persistente.

```ts
{
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  action?: string;
  payload?: Record<string, unknown>;
}
```

Para crear una meta:

```text
CONFIRM_CREATE_SAVINGS_GOAL
```

### `goal-progress`

Propósito: mostrar una meta ya persistida.

```ts
{
  title: string;
  targetAmount: number;
  currentAmount: number;
  monthlyContribution?: number;
  targetDate?: string;
}
```

---

## 8. Intenciones conocidas del backend

El backend actual ya trabaja con clasificación de intención. Para el frontend la intención es informativa; no debe usarse para sustituir el renderer dinámico.

Ejemplos relevantes:

```text
FIRST_HOME
CAR_PURCHASE
SAVINGS_GOAL
GENERAL
```

Si después se agregan más life events, idealmente el frontend no cambia mientras puedan expresarse usando los componentes existentes.

---

## 9. Modo MOCK para trabajar sin backend

El scaffold incluye:

```text
src/mocks/mock-agent.ts
```

Y esta variable:

```env
VITE_USE_MOCKS=true
```

En mock mode se pueden probar actualmente:

```text
"Quiero comprar mi primera casa"
```

→ devuelve resumen financiero, capacidad hipotecaria, simulador y comparación.

```text
"Quiero ahorrar"
```

→ devuelve formulario de meta.

Después:

```text
REQUEST_CREATE_SAVINGS_GOAL
```

→ devuelve confirmación.

Después:

```text
CONFIRM_CREATE_SAVINGS_GOAL
```

→ devuelve progreso de la meta.

Esto permite desarrollar navegación, responsive, componentes, animaciones y UX sin tener disponible Gemini/MCP.

---

## 10. Cambio de mock a backend real

No reescribir componentes.

Únicamente cambiar `.env`:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:3000/api
```

El adapter real está en:

```text
src/api/agent-api.ts
```

Si backend respeta los contratos definidos arriba, el resto del frontend debe continuar funcionando sin cambios.

---

## 11. Manejo de sesión

Regla:

```text
Primera petición
sessionId = undefined

Backend crea AgentSession
↓
response.sessionId
↓
Frontend guarda sessionId
↓
Todas las peticiones siguientes reutilizan ese sessionId
```

En el scaffold vive temporalmente en `useAgent()`.

Para el hackathon no es necesario persistirlo en Redux. Si quieren soportar refresh, se puede guardar en `sessionStorage`.

---

## 12. Usuario / autenticación

El scaffold usa un `DEMO_USER_ID` temporal dentro de:

```text
src/hooks/useAgent.ts
```

Cuando backend termine auth hay dos alternativas:

### Opción preferida

Backend obtiene `userId` desde JWT y se elimina `userId` de los bodies.

```text
Authorization: Bearer <token>
```

### Opción demo

Mantener `userId` explícito.

No bloquear el desarrollo visual por auth.

---

## 13. Estados UX obligatorios

Todo flujo debe contemplar:

- initial / empty
- loading
- success
- validation error
- API error
- unknown component
- no products
- no financial profile
- tool/backend unavailable

Para demo, `loading` debe sentirse intencional, no como página congelada.

Sugerencia visual:

```text
"Analizando tu objetivo..."
"Consultando tu panorama financiero..."
"Construyendo opciones..."
```

No fingir en frontend cuál tool está ejecutando si backend no envía esa información.

---

## 14. Reglas de seguridad/UX

1. No renderizar HTML recibido del modelo con `dangerouslySetInnerHTML`.
2. No ejecutar nombres de funciones enviados por backend dinámicamente fuera del catálogo de acciones permitido.
3. Validar `AdaptiveUIResponse` antes de renderizar.
4. Acciones persistentes deben tener paso de confirmación.
5. Mostrar montos en MXN con `Intl.NumberFormat("es-MX")`.
6. Tratar capacidades, pagos y simulaciones como estimaciones si backend no declara aprobación formal.
7. No guardar información financiera sensible innecesaria en localStorage.
8. Token, si existe, sí requiere una estrategia definida por backend; el helper actual solo es placeholder de integración.

---

## 15. Diseño visual recomendado

Dirección:

```text
fintech premium + claro + deportivo/dinámico
```

No convertir la experiencia en un chat tradicional de pantalla completa. La conversación inicia el flujo, pero el valor del proyecto es que **aparece una interfaz específica para la meta**.

Layout recomendado desktop:

```text
┌───────────────────────────────────────────────┐
│ Header                                        │
├───────────────────────────────────────────────┤
│ ¿Qué quieres lograr hoy?                      │
│ [ Quiero comprar mi primera casa... ] [→]     │
├───────────────────────────────────────────────┤
│ Mensaje del copiloto                          │
├───────────────────┬───────────────────────────┤
│ Resumen financiero│ Capacidad estimada        │
├───────────────────┴───────────────────────────┤
│ Simulador hipotecario                         │
├───────────────────────────────────────────────┤
│ Comparación de productos                      │
└───────────────────────────────────────────────┘
```

En móvil todo pasa a una columna.

El scaffold ya tiene layout responsive básico.

No usar el logo oficial si el equipo no cuenta con el asset autorizado; el scaffold usa un monograma neutral.

---

## 16. Estructura actual

```text
Banorte-hackathon-frontend-scaffold/
├─ .env.example
├─ index.html
├─ package.json
├─ README.md
├─ FRONTEND_HANDOFF.md
├─ tsconfig.json
├─ tsconfig.app.json
└─ src/
   ├─ api/
   │  ├─ agent-api.ts
   │  └─ http.ts
   ├─ components/
   │  ├─ adaptive/
   │  │  ├─ AdaptiveRenderer.tsx
   │  │  ├─ Confirmation.tsx
   │  │  ├─ FinancialSummary.tsx
   │  │  ├─ GoalProgress.tsx
   │  │  ├─ MortgageCapacity.tsx
   │  │  ├─ MortgageSimulator.tsx
   │  │  ├─ ProductComparison.tsx
   │  │  └─ SavingsGoalForm.tsx
   │  ├─ layout/
   │  │  └─ AppShell.tsx
   │  └─ ui/
   │     ├─ Button.tsx
   │     └─ Card.tsx
   ├─ features/
   │  └─ agent/
   │     └─ AgentComposer.tsx
   ├─ hooks/
   │  └─ useAgent.ts
   ├─ mocks/
   │  └─ mock-agent.ts
   ├─ pages/
   │  ├─ AgentPage.tsx
   │  └─ HomePage.tsx
   ├─ state/
   │  └─ agent-store.ts
   ├─ types/
   │  ├─ adaptive-ui.ts
   │  └─ agent.ts
   ├─ utils/
   │  └─ currency.ts
   ├─ App.tsx
   ├─ main.tsx
   └─ styles.css
```

---

## 17. Qué debe implementar/mejorar el siguiente agente

### Prioridad P0 — imprescindible para demo

- Ejecutar el scaffold y corregir cualquier ajuste de tooling local.
- Pulir Home y AgentPage visualmente.
- Mantener `AdaptiveRenderer` como única puerta de entrada a componentes dinámicos.
- Mantener mocks funcionando.
- Probar el flujo FIRST_HOME completo.
- Probar creación de SAVINGS_GOAL con confirmación.
- Hacer responsive real a 360px / 768px / desktop.
- Crear skeleton/loading state visual.
- Error boundary o fallback visual para respuesta inválida.
- Validaciones de formularios antes de enviar interact.

### P1 — muy recomendable

- Animación suave al aparecer/reemplazarse componentes.
- Historial visual mínimo de mensajes del agente.
- Persistir `sessionId` en sessionStorage.
- Botón "Nueva conversación".
- Estado de retry ante error de red.
- Accesibilidad: labels, focus, teclado, contraste.

### P2 — solo si sobra tiempo

- Gráficas.
- Animaciones complejas.
- Dark mode.
- Personalización visual extensa.
- Más life events.

---

## 18. Criterio de DONE del frontend

El frontend MVP está terminado cuando puede demostrar este flujo:

```text
1. Abrir /app
2. Escribir "Quiero comprar mi primera casa"
3. Renderizar respuesta adaptativa desde mocks o backend
4. Mostrar financial-summary
5. Mostrar mortgage-capacity
6. Mostrar mortgage-simulator
7. Mostrar product-comparison
8. Cambiar enganche/plazo
9. Enviar /agent/interact
10. Renderizar simulación actualizada
11. Iniciar una meta de ahorro
12. Mostrar savings-goal-form
13. Solicitar creación
14. Mostrar confirmation
15. Confirmar
16. Mostrar goal-progress
```

Y al cambiar:

```env
VITE_USE_MOCKS=true
```

por:

```env
VITE_USE_MOCKS=false
```

no debe ser necesario reescribir la UI.

---

## 19. Contrato que backend y frontend deben congelar cuanto antes

Antes de conectar integración real, ambos equipos deben acordar solo estas cinco cosas:

```text
1. Body exacto de POST /api/agent/message
2. Body exacto de POST /api/agent/interact
3. Forma exacta de AdaptiveUIResponse
4. Nombres exactos de component.type
5. Nombres exactos de action
```

Todo lo demás puede cambiar internamente sin bloquear equipos.

Acciones propuestas para congelar:

```text
UPDATE_MORTGAGE_SIMULATION
SELECT_PRODUCT
REQUEST_CREATE_SAVINGS_GOAL
CONFIRM_CREATE_SAVINGS_GOAL
CANCEL
RESET_SESSION
```

No es obligatorio que backend implemente todas para la primera demo.

---

## 20. Instrucción lista para pegar a otro agente

```text
Trabaja sobre este frontend React + TypeScript para el proyecto Adaptive Life del hackathon.

No cambies la arquitectura central. El backend utiliza un agente con Gemini y MCP, pero eso es transparente para frontend. Frontend solo puede integrarse mediante POST /api/agent/message y POST /api/agent/interact.

La UI es dinámica: backend devuelve AdaptiveUIResponse con un catálogo cerrado de component.type. Mantén AdaptiveRenderer como registry central. Nunca renderices HTML arbitrario enviado por el LLM y no conviertas el proyecto en un chat tradicional; el diferenciador es que la interfaz cambia según la meta financiera del usuario.

Mientras el backend no esté listo, usa VITE_USE_MOCKS=true y trabaja contra src/mocks/mock-agent.ts. Cuando backend esté listo debe bastar poner VITE_USE_MOCKS=false.

Prioridades:
1. mantener el proyecto ejecutable;
2. mejorar calidad visual y responsive;
3. terminar los estados loading/error/empty;
4. mantener los contratos en src/types;
5. completar FIRST_HOME y SAVINGS_GOAL end-to-end;
6. no agregar dependencias innecesarias;
7. no implementar MCP ni llamadas directas a servicios financieros en frontend.

Antes de modificar los contratos, revisa FRONTEND_HANDOFF.md. Si backend todavía no congeló un campo, conserva el adapter para que la corrección futura esté aislada en src/api y src/types.
```

---

## 21. Nota sobre el backend actual

Al momento de preparar este handoff, el backend ya tiene gran parte de dominio/servicios/repositorios y está terminando la orquestación del agente y MCP. Por eso el front debe asumir que **los endpoints del agente son la interfaz estable deseada**, pero mantener el modo mock hasta que el contrato final sea confirmado por el equipo de backend.

No acoplar el frontend a la implementación temporal actual de `AgentService`.
