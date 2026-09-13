Adaptive Life — Frontend Scaffold

Frontend MVP para el hackathon. Está preparado para desarrollarse sin esperar al backend usando mocks locales y cambiar después a API real con una variable de entorno.

Arranque

npm install
cp .env.example .env
npm run dev

Modo independiente del backend:

VITE_USE_MOCKS=true

Cuando el backend esté listo:

VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCKS=false

Flujo soportado

Usuario describe una meta en lenguaje natural.

POST /api/agent/message devuelve AdaptiveUIResponse.

AdaptiveRenderer convierte cada component.type en un componente React.

Interacciones de UI llaman POST /api/agent/interact.

Backend devuelve un nuevo AdaptiveUIResponse y la pantalla se recompone.

Ver FRONTEND_HANDOFF.md para contratos y guía completa.