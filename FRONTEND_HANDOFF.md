# Entrega actual: Banorte Adaptive Life

La implementación anterior de Boreas se reemplazó. La documentación vigente está en [README.md](README.md) y [docs/CONTRACTS.md](docs/CONTRACTS.md).

Incluye registro/onboarding, autenticación, dashboard real, perfil financiero, metas, experiencias, simulaciones, siete componentes adaptativos y ciclo mensaje/interacción/confirmación/recuperación. No utiliza mocks en producción.

El backend se amplió con registro transaccional, JWT y control de propiedad de recursos, sesiones y UI persistidas, y `/api/agent/interact`. Simular y crear una meta pasan por el protocolo MCP en memoria hacia los servicios existentes.

Verificación: builds TypeScript/Vite y backend; pruebas HTTP aisladas; pruebas Playwright del flujo completo, responsive, errores y renderer seguro. Ver README para ejecutar y para las limitaciones explícitas de la infraestructura de pruebas.
