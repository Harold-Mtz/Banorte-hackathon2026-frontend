# Banorte Boreas

Frontend web responsive para la demo del hackathon Banorte. Boreas transforma una meta financiera escrita en lenguaje natural en una interfaz adaptativa: resumen, capacidad, simulacion y acciones concretas.

## Arranque

```bash
npm install
copy .env.example .env
npm run dev
```

Credencial local del usuario seed:

- Correo: `ana.martinez@demo.com`
- Contraseña: `Boreas2026!`

El modo demo usa mocks locales y no necesita backend:

```env
VITE_USE_MOCKS=true
```

Para conectar el agente real:

```env
VITE_USE_MOCKS=false
VITE_API_BASE_URL=http://localhost:3000/api
```

La UI solo consume `POST /api/agent/message` y `POST /api/agent/interact`. El renderer acepta un catalogo cerrado de componentes y valida la respuesta con Zod antes de dibujarla.

## Flujos demo

- `Quiero comprar mi primera casa`: panorama financiero, capacidad, simulador y comparacion.
- `Quiero empezar a ahorrar`: meta, confirmacion y progreso.

## Comandos

```bash
npm run dev
npm run build
npm run preview
```