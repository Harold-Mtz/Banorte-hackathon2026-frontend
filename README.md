# Banorte Boreas

Demo financiera adaptativa con React, TypeScript, Vite y PostgreSQL mediante la Agent API. Conserva el diseño Boreas y el logo de Banorte.

## Arranque local

Backend, en `C:\Users\pemil\Hackaton\Back\Banorte-hackathon-backend`:

```powershell
npm.cmd run db:migrate
npm.cmd start
```

`db:migrate` compila y aplica la migración idempotente de metas y auditoría. Requiere una base existente con el esquema inicial. Para una instalación nueva, aplicar primero `database/schema.sql` y después `database/seed.sql`, una sola vez.

Frontend:

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Abre la URL que imprime Vite. Si 5173 está ocupado, Vite elige otro puerto.

Configuración real en `.env`:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:3000/api
```

Credencial del seed: `ana.martinez@demo.com` / `Boreas2026!`.

El login guarda token, usuario y conversación en `sessionStorage`; el dashboard carga automáticamente. “Salir” borra el contexto local. “Nueva conversación” inicia otra sesión sin eliminar metas ni movimientos.

## Flujos

- Dashboard con ingreso, gasto, deuda mensual, disponible estimado, ahorro, score, metas y crédito del catálogo.
- Metas genéricas con nombre, monto, fecha, aportación y próximos pasos.
- Selección, edición, pausa, reactivación, cancelación, archivo y eliminación lógica de metas.
- Depósitos/aportaciones, ingresos, gastos y retiros con vista previa y confirmación.
- Hipotecas calculadas por el servicio con tasa, plazo y límites del producto.
- Historial y controles disponibles en escritorio y móvil.

El navegador solo consume login y las rutas `/api/agent/message` y `/api/agent/interact`. No llama a PostgreSQL, Gemini ni MCP. El renderer y las acciones tienen un catálogo cerrado.

## Pruebas

```powershell
npm.cmd test
npm.cmd run build
```

En backend:

```powershell
npm.cmd run test:demo
```

Las pruebas del backend crean registros aleatorios de prueba y eliminan únicamente esos registros al terminar. Guardan respuestas sin tokens en `artifacts/contract-fixtures.json`; las pruebas del frontend también validan y renderizan esas respuestas cuando el archivo está disponible.

Prueba de las credenciales reales, sin registrar movimientos:

```powershell
$env:BOREAS_DEMO_EMAIL = 'ana.martinez@demo.com'
$env:BOREAS_DEMO_PASSWORD = 'Boreas2026!'
node scripts/test-live.cjs
```

## Notas

- Los mocks se activan exclusivamente con `VITE_USE_MOCKS=true` y muestran una etiqueta. Son un fixture legado de respuestas; la autenticación sigue usando la API real.
- El catálogo seed contiene hipotecas. Si no hay productos activos de auto o préstamos, se muestra un estado vacío; no se sustituyen por una hipoteca.
- Las cantidades escritas en lenguaje natural se reconocen cuando son explícitas; el formulario permite completar o corregir cualquier dato faltante.
- La validación visual interactiva requiere un navegador conectado. En esta sesión se validaron contratos y renderizado React, sin captura visual.
- Guion detallado: [05-DEMO-SCRIPT.md](HACKATON%20PLAN/05-DEMO-SCRIPT.md).
