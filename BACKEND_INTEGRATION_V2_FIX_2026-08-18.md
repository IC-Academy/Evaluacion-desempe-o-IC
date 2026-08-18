# Backend Integration v2 — correcciones de UI

Fecha: 2026-08-18

## Correcciones

1. Saludo del colaborador
   - Se corrigió el nombre corto cuando el maestro corporativo entrega nombres en formato `APELLIDO PATERNO APELLIDO MATERNO NOMBRE(S)` en mayúsculas.
   - El nombre completo permanece intacto en la ficha; solo el saludo usa el primer nombre detectado.

2. Portal del líder
   - Se corrigió la unión visual entre nombre y número de empleado en la tabla de equipo.

3. Portal de Desarrollo Organizacional
   - Se eliminó la vista API compacta que sustituía el dashboard premium.
   - La lectura real conserva ahora el shell premium, tabs de métricas y layout ejecutivo.
   - Los grupos Avance, Objetivos, Calibración, Retroalimentación, Alertas y Talento consumen exclusivamente los agregados presentes en `/admin/dashboard`.
   - Cuando el backend no devuelve detalle, se muestra un estado vacío/gap explícito; no se rellenan cifras demo.
   - Se mantiene botón de actualización y aviso de que la escritura continúa pendiente.

## Seguridad / alcance

- No se modificaron endpoints ni contratos backend.
- No se habilitó escritura.
- No se sustituyen datos reales por datos demo en la vista API.
