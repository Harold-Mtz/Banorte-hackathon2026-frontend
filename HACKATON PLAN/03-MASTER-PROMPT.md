# Master prompt para agentes futuros

Trabaja en el proyecto Banorte Boreas del hackathon Monterrey.

Lee primero todos los MD de `HACKATON PLAN`, `FRONTEND_HANDOFF.md` y `aahhhhh.MD`. Hay dos repos: frontend React/Vite/TypeScript y backend Express/TypeScript/PostgreSQL. Respeta los límites: navegador -> Agent API; Agent API -> servicios/tools/MCP; servicios -> repositorios/PostgreSQL.

No conviertas el producto en un chat genérico. El mensaje es la entrada y la interfaz adaptativa es el producto. Mantén un catálogo cerrado de componentes y no uses HTML arbitrario del modelo.

## Intenciones abiertas

El usuario puede pedir cualquier objetivo financiero, no solo casa, auto o ahorro. Ejemplos: tener un perro, comprar un celular o computadora, mudanza, renta, salud, estudios, viaje, boda, negocio, fondo de emergencia o liquidar deuda.

No clasifiques un caso desconocido como `FIRST_HOME`. Usa `GENERAL_GOAL` y pregunta solo lo indispensable: qué quiere lograr, cuánto necesita aproximadamente, para cuándo y cuánto puede aportar. Si el mensaje ya contiene esos datos, no vuelvas a preguntarlos.

La intención describe el objetivo, pero no debe controlar toda la UI. Todo objetivo debe poder representarse como un plan financiero genérico; los módulos especializados se agregan solo cuando aplican.

## Gestión completa de metas

El usuario debe poder seleccionar una meta activa, crearla, editar nombre/monto/fecha/aportación, pausar, reactivar, cancelar, archivar o eliminarla lógicamente. También debe poder registrar aportaciones, retiros parciales y ajustes, ver progreso, ritmo real, fecha estimada, impacto de gastos y cambiar de meta antes de registrar un movimiento.

Para objetivos como perro o celular, muestra un plan concreto con categoría, checklist y próximos pasos; no una respuesta genérica de chat.

Prioridades:

1. No hardcodear datos financieros, productos, saldos, metas o aprobaciones.
2. Usar las tools de dominio para construir dashboard, metas, movimientos, alertas y crédito.
3. Mantener JWT, login, logout y autorización por `sub`.
4. Toda mutación financiera debe persistirse, validarse y confirmarse.
5. Antes de gastos/retiros, mostrar impacto proyectado y pedir confirmación.
6. Mantener mocks únicamente como fallback explícito.
7. Cambiar poco, compilar ambos repos y probar un flujo punta a punta.
8. No hacer commits destructivos ni revertir cambios ajenos.
9. Cuando una intención no sea específica, conservar el contexto y ofrecer un plan genérico gestionable.
10. No confundir “quiero ahorrar para X” con “quiero crédito para X”.
11. Toda acción de editar, pausar, cancelar, archivar, eliminar o retirar requiere ownership y confirmación cuando tenga efecto financiero.

Al terminar reporta archivos, migraciones pendientes, comandos de prueba y cualquier limitación real.
