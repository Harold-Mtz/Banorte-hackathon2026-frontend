# Banorte Adaptive Life

Aplicación React + TypeScript que conecta objetivos de vida con datos financieros reales y pantallas adaptativas. El MVP completo es **Mi primera casa**. No existe modo mock en la aplicación.

## Arranque

En otra terminal, inicia el backend desde `../../Backend/Banorte-hackathon-backend` con `npm install` y `npm run dev`. Consulta su README para PostgreSQL, JWT y Gemini.

En esta carpeta:

```sh
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:5173`. La única variable pública es:

```env
VITE_API_URL=http://localhost:3000
```

Es la URL raíz del servidor, **sin `/api` al final**. Se incorpora al compilar. Nunca pongas secretos de Gemini, JWT, MCP o PostgreSQL en variables `VITE_*`.

## Recorrido

1. Registra una cuenta en `/register`.
2. Completa tu perfil financiero y elige tu objetivo.
3. Escribe «Quiero comprar mi primera casa».
4. Selecciona un producto del catálogo, valor de propiedad, enganche y plazo.
5. Actualiza la simulación; el servidor calcula y guarda el escenario.
6. Prepara una meta de ahorro y confirma sus detalles para persistirla.
7. Consulta metas, experiencias e historial hipotecario; selecciona dos simulaciones para comparar.
8. Recarga: se conserva la autenticación y se recupera la UI desde el servidor.

Las cifras cero del perfil de una cuenta nueva son valores iniciales persistidos; el onboarding solicita tus datos. El catálogo hipotecario viene de PostgreSQL. Si está vacío, se muestra un estado vacío.

## Arquitectura

- `src/api`: cliente HTTP único, errores consistentes y contratos REST.
- `src/models`: tipos derivados del backend; fechas serializadas como strings.
- `src/features/auth`: sesión, registro y login; logout limpia cachés y estado persistido.
- `src/features/agent`: command input, sesión e interacciones.
- `src/components/adaptive-ui`: renderer, registro cerrado, validación de props y siete componentes separados.
- `src/pages`: dashboard, finanzas, ahorro, hipotecas, experiencias y perfil.
- React Router, TanStack Query, React Hook Form, Zod, Tailwind, Recharts y Lucide.

El renderer interpreta `props` y `actions`. Nunca evalúa HTML, JSX ni código recibido. Los tipos desconocidos y datos incompletos muestran un fallback seguro. Las acciones se validan también contra la UI persistida en el servidor.

Consulta [los contratos](docs/CONTRACTS.md). Los documentos de `HACKATON PLAN` corresponden a la implementación anterior y no describen la aplicación actual.

## Validación

```sh
npm run build
# Compilar primero el backend para las pruebas locales:
npm --prefix ../../Backend/Banorte-hackathon-backend run build
npx playwright install chromium
npm test
```

Playwright levanta Vite y el backend Express real con un adaptador SQL **solo de pruebas** y un clasificador LLM determinista. No toca tu PostgreSQL ni llama a Gemini. Comprueba registro, onboarding, interacciones, confirmación, historial, recarga, logout, errores, renderer seguro, contraste WCAG AA del dashboard y ausencia de overflow a 390/768/1366/1440/1920 px. Las capturas quedan en `artifacts/`.

La conectividad real con PostgreSQL y Gemini se verifica por separado mediante `node scripts/check-services.cjs` en el backend. Las pruebas aisladas no reemplazan una validación del despliegue de producción.

## Despliegue

```sh
npm ci
npm run build
```

Publica `dist/`. Configura `VITE_API_URL` con la URL HTTPS del backend **antes** del build y `FRONTEND_URL` en el backend con el origen publicado.

Se incluyen `vercel.json` y `public/_redirects` para que React Router funcione al recargar rutas. En otro hosting, reescribe rutas inexistentes a `/index.html`, conservando archivos estáticos. Para previsualizar localmente: `npm run preview`.

## Alcance

Los otros cinco tipos de experiencia se registran y muestran con nombres amigables; sus flujos especializados están anunciados como próximos. No se inventan cálculos para ellos. No hay endpoint para editar nombre/correo, movimientos financieros, historia de saldos ni cancelar metas/experiencias; esos controles no se presentan como funcionales. Las metas admiten creación y actualización del importe acumulado según los endpoints existentes.
