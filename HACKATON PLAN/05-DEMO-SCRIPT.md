# Guion de demo Boreas

## Preparación

1. Iniciar backend y frontend según README.
2. Verificar `VITE_USE_MOCKS=false`.
3. Abrir la URL de Vite.
4. Iniciar sesión con `ana.martinez@demo.com` / `Boreas2026!`.
5. El tablero debe cargar automáticamente. Los datos visibles provienen de la base configurada.

## 1. Panorama

Escribir “Quiero ver mi dashboard financiero”. Mostrar ingreso, gasto, deuda mensual, disponible estimado, ahorro, score si existe, metas, actividad y productos del catálogo.

Explicar que Boreas cambia la interfaz según la necesidad; la conversación es una entrada al tablero.

## 2. Objetivo genérico

Escribir “Quiero ahorrar para un celular de 12000 y aportar 1000 al mes para 2027-12-01”.

Estos son valores de entrada para ilustrar el flujo, no valores predefinidos por la aplicación.

Revisar nombre, monto, fecha y aportación en el formulario. Pulsar “Revisar mi meta”. Mostrar que todavía es una propuesta. Confirmar y observar la nueva meta en el dashboard.

Seleccionar la meta, editar sus datos y confirmar el cambio. Pausar y reactivar para mostrar su ciclo de vida.

## 3. Aportación

En la tarjeta de la meta, ingresar un monto elegido para la demostración y pulsar “Revisar”.

Mostrar la vista previa, confirmar y verificar que suben el saldo y progreso de la meta y que aparece un movimiento con categoría y fecha.

## 4. Prevención

Elegir “Gasto” en Registrar movimiento. Ingresar un monto que supere el disponible que muestra el tablero.

La vista previa debe indicar el disponible antes y después y, cuando corresponda, el retraso estimado de las metas. Cancelar primero y demostrar que el movimiento no aparece en el historial.

Preparar un nuevo gasto y confirmar para mostrar la persistencia. Aclarar que se trata de un registro en la demo, no de una transferencia bancaria.

## 5. Retiro

Elegir una meta con saldo y preparar un retiro menor que ese saldo. Revisar impacto, confirmar y observar que bajan el ahorro, el saldo de la meta y el disponible del mes.

## 6. Crédito

Escribir “Quiero comprar mi primera casa”. Mostrar productos reales, tasa, CAT, plazos y límites.

Elegir un producto e ingresar valor, enganche y plazo dentro de sus límites. Calcular. La mensualidad solo aparece después del cálculo del servicio y se etiqueta como estimación.

Escribir “Quiero comprar un auto”. Si el catálogo no contiene autos, mostrar el estado vacío de esa categoría. Nunca presentar una hipoteca como crédito automotriz.

## 7. Contexto y salida

Mostrar historial y “Nueva conversación”. Las metas permanecen porque están en PostgreSQL. Recargar para comprobar la sesión. Pulsar “Salir” y verificar el regreso al login.

## Revisión manual antes de presentar

- Probar escritorio, 768px y 360px.
- Verificar foco visible, inputs etiquetados y botones deshabilitados durante solicitudes.
- Probar una confirmación y un reintento después de un error de red.
- No llamar “aprobación” a una simulación ni al catálogo seed.
