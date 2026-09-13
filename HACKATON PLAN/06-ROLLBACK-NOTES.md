# Notas de reversión

Los cambios se hicieron sobre devl, sin commits, pushes, resets ni reversión de cambios previos del usuario.

## Código

Revisar el diff de cada repo. Para retirar una parte, revertir únicamente sus hunks en frontend y backend juntos, conservando los cambios previos de HACKATON PLAN y aahhhhh.MD.

No reactivar las rutas antiguas de mutación sin implementar autorización y ownership. No retirar los recibos de confirmación si existen clientes capaces de reintentar operaciones.

## Base de datos

Migración aplicada: `database/migrations/001-demo-integrity.sql`.

Añade metadata de metas, estados de ciclo de vida y auditoría. Puede repetirse; no borra metas ni movimientos. El esquema inicial también incluye estos cambios para instalaciones nuevas.

No eliminar goal_audit ni convertir automáticamente estados nuevos a antiguos. Una reversión de código puede conservar las columnas y auditoría aditivas. Para regresar a restricciones antiguas es necesario revisar primero las metas PAUSED, ARCHIVED y DELETED y definir una conversión explícita.

## Pruebas y limpieza

`npm.cmd run test:demo` elimina solo registros de prueba identificados por los IDs aleatorios que creó esa ejecución. No limpia ni reinicia a Ana.

`artifacts/contract-fixtures.json` contiene respuestas de esos usuarios temporales, sin tokens. Es un archivo generado e ignorado por git.

## Límite de la entrega

Los builds, la persistencia PostgreSQL, el contrato React y las credenciales reales fueron comprobados. La revisión visual en navegador está pendiente porque no había navegador conectado.
