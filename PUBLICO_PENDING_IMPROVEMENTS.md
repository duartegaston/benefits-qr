# Pendientes detectados en la rama `publico`

Este documento deja registradas mejoras posibles detectadas durante la revisión de la rama, **sin aplicarlas todavía**.

## Prioridad alta

### 1. `ReclamarFormAnonimo` y posible mismatch de hidratación
- **Qué se vio:** hoy lee `sessionStorage` dentro del initializer de `useState`.
- **Riesgo:** el server puede renderizar `null` y el cliente hidratar con un `reclamoId` ya existente.
- **Sugerencia:** mover esa lectura a una estrategia post-mount (`useEffect` / `isMounted`) para evitar desalineación SSR/CSR.

### 2. Anchor `#beneficios` puede quedar roto
- **Qué se vio:** el navbar siempre muestra `#beneficios`, pero `PublicBenefitsSection` devuelve `null` si no hay beneficios públicos.
- **Riesgo:** el usuario puede ver un ítem en el navbar que no tiene sección real.
- **Sugerencia:** o bien renderizar siempre la sección con empty state, o esconder ese ítem del navbar cuando no exista la sección.

### 3. Menú mobile cerrado sigue montado
- **Qué se vio:** el menú mobile se oculta visualmente con `opacity` y `pointer-events-none`, pero permanece montado.
- **Riesgo:** semántica/accesibilidad mejorable para navegación por teclado o lectores.
- **Sugerencia:** desmontar cuando está cerrado o reforzar ocultamiento semántico real (`hidden` / control del árbol accesible).

### 4. Branding inconsistente (`Qupón` / `Qupon`)
- **Qué se vio:** hay variantes distintas del naming en metadata, alt text y textos del proyecto.
- **Riesgo:** inconsistencia de marca.
- **Sugerencia:** definir una versión canónica y unificarla repo-wide.

## Prioridad media

### 5. IDs de secciones acoplados por strings repetidos
- **Qué se vio:** los ids del landing navbar y de las sections viven repartidos en varios archivos.
- **Riesgo:** si alguien renombra una sección, la navegación puede romperse sin error de compilación.
- **Sugerencia:** centralizar anchors/ids en una constante compartida del landing.

### 6. Paginación con `aria-disabled` sobre anchors
- **Qué se vio:** en la paginación del catálogo se usa `aria-disabled` sobre links con `href`.
- **Riesgo:** semántica y accesibilidad incompletas; además es una deuda repetida en otras páginas del repo.
- **Sugerencia:** crear un patrón compartido donde el control deshabilitado no siga siendo navegable.

### 7. `publicBenefitsService` / repository podrían simplificarse
- **Qué se vio:** algunos contratos cargan ruido innecesario (`beneficios | null`, `total` cuando no siempre se usa).
- **Riesgo:** más complejidad mental de la necesaria.
- **Sugerencia:** simplificar shapes y tipos para reflejar mejor la realidad del query (`COALESCE []`).

## Nice to have

### 8. Extraer utilidad o componente para iniciales/avatar de local
- **Qué se vio:** la lógica de initials/fallback se repite en varios lugares del proyecto.
- **Sugerencia:** unificarla en una util o componente reusable.

### 9. Revisar jerarquía semántica de headings en landing
- **Qué se vio:** algunas cards de secciones usan headings que podrían bajar de nivel.
- **Sugerencia:** revisar `h2`/`h3` en bloques como `LandingAudienceCtas` para tener una estructura documental más prolija.

## Nota sobre visibilidad de beneficios privados

Se detectó que `/beneficio/[id]` hoy no restringe por `esPublico`, pero **esto no se considera automáticamente bug** porque en el proyecto ya existe la semántica de:

- beneficio privado = no listado
- pero accesible por link directo

Si se quisiera cambiar eso, debería definirse como decisión explícita de producto antes de tocar la ruta pública.
