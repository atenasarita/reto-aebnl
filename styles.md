# Guía de estilo visual — reto-aebnl (cliente React)

Este documento fija **tokens y convenciones** para que páginas y módulos (beneficiarios, inventario, reportes, dashboard, login) **compartan paleta, tipografía, espaciado y patrones de layout**. Hoy coexisten varias fuentes de verdad CSS (véase §6); al implementar vistas nuevas **seguí primero esta guía** y, al tocar vistas viejas, **acercalas** gradualmente sin inventar valores nuevos fuera del sistema.

---

## 1. Principios

1. **Una familia tipográfica** para UI (la barra superior ya usa Montserrat — alinear el resto).
2. **Una escala de grises** tipo “slate” + **un azul de marca** (no mezclar cinco hex de azul distintos en la misma pantalla sin motivo).
3. **Espaciado en múltiplos de 4px** y **radios coherentes** (8 / 12 / 14–16 px según superficie).
4. **Layouts de página** con el mismo tipo de “caja” horizontal (márgenes máximos, `max-width` cuando aplique).
5. Preferir **variables CSS** en un solo archivo global (`client/src/index.css` o nuevo `tokens.css`) en lugar de duplicar hex en cada hoja.

---

## 2. Tokens recomendados (canónicos)

Definí **estos valores** como referencia oficial. Cuando refactorices un componente que use otro hex cercano (p. ej. `#2847a8` vs `#25449c`), **sustituí por el token** más cercano o ampliá el tema con decisión documentada aquí.

### 2.1 Colores — marca y UI


| Token                   | Hex       | Uso                                                                                                              |
| ----------------------- | --------- | ---------------------------------------------------------------------------------------------------------------- |
| `--color-brand`         | `#1e40af` | Primario fuerte (CTA principal, enlaces destacados); cercano al activo del navbar `#1e3a8a` / botones `#1E3B8A`. |
| `--color-brand-hover`   | `#1d4ed8` | Hover sobre primario.                                                                                            |
| `--color-brand-soft`    | `#e0e7ff` | Fondo “pestaña activa” / chips (alineado a `.linkActive` del navbar).                                            |
| `--color-accent`        | `#f4a300` | Acentos (dashboard ya lo usa para tarjetas de acción).                                                           |
| `--color-success`       | `#1f9d55` | Éxito (dashboard).                                                                                               |
| `--color-surface-page`  | `#f5f7fb` | Fondo página (entre login `#f4f6fa`, dashboard `#f5f7fb`, shadcn blanco sobre grises).                           |
| `--color-surface-card`  | `#ffffff` | Tarjetas / paneles.                                                                                              |
| `--color-border`        | `#e2e8f0` | Bordes suaves (alineado a `shadcn-card`).                                                                        |
| `--color-border-strong` | `#dbe3ee` | Bordes un poco más visibles (dashboard action-card-light).                                                       |


### 2.2 Neutros (texto y estados secundarios)


| Token                    | Hex       | Uso                                                        |
| ------------------------ | --------- | ---------------------------------------------------------- |
| `--color-text-primary`   | `#0f172a` | Texto principal (shadcn `slate`-900).                      |
| `--color-text-secondary` | `#475569` | Texto secundario / pies de bloque (slate-600).             |
| `--color-text-muted`     | `#64748b` | Descripciones, hints (slate-500).                          |
| `--color-icon-muted`     | `#6b7280` | Iconos sutiles (gris Tailwind-500 — botón ajustes navbar). |


**Regla:** no introducir **nuevos** grises `#1f2937`, `#374151`, etc., en vistas nuevas; mapearlos a la tabla anterior para no acumular variantes imperceptibles.

### 2.3 Tipografía


| Uso              | Recomendación                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Fuente principal | `**Montserrat`**, pesos **400–800** (Navbar ya la importa; conviene cargar una sola vez en `index.html` o en `index.css` y usarla globalmente). |
| Fallback         | `system-ui`, `-apple-system`, `Segoe UI`, `Arial`, `sans-serif`.                                                                                |
| Pesos típicos    | 400 texto, 500–600 navegación y botones secundarios, 700–800 títulos.                                                                           |


**Eliminar objetivo:** mezclas `Arial` en login/dashboard **vs** Montserrat solo en navbar; unificar `**body`** con la familia canónica.

### 2.4 Escala tipográfica (orientativa)


| Rol                  | Tam.                                      | Ejemplo de uso                                     |
| -------------------- | ----------------------------------------- | -------------------------------------------------- |
| Display / hero login | Mantener sólo donde sea diseño fijo único | Página login (excepción documentada).              |
| **H1 página**        | `28px–32px`, `font-weight: 700–800`       | Título principal bajo navbar.                      |
| **H2 sección**       | `20px–22px`, `font-weight: 700`           | Secciones de formulario/listado.                   |
| **H3 tarjeta**       | `18px`, `font-weight: 700–800`            | `shadcn-card-title`.                               |
| Cuerpo               | `14px–16px`, `font-weight: 400`           | Contenido, tablas (16px donde haya densidad alta). |
| Meta / captions      | `12px–13px`, peso 600–700 si es etiqueta  | Tooltips chart, badges.                            |


Evitar tamaños tipo `20px`, `42px`, `72px`, `110px` fuera de la pantalla de login salvo nueva decisión explícita de diseño.

### 2.5 Espaciado y radios

Base **4px**:


| Token      | px  | Uso                                                                   |
| ---------- | --- | --------------------------------------------------------------------- |
| `space-2`  | 8   | `gap` pequeños, padding ítems lista.                                  |
| `space-3`  | 12  | Botones compactos internos.                                           |
| `space-4`  | 16  | Gap estándar en filas, padding horizontal secciones.                  |
| `space-5`  | 20  | Separación medio entre grupos de campos (ya usado en varias páginas). |
| `space-6`  | 24  | Padding exterior de paneles tipo dashboard main.                      |
| `space-8`  | 32  | Margen contenido desde borde cuando no hay navbar full-bleed.         |
| `space-16` | 64  | **Contenedor página** cuando se use patrón `32px 64px` — ver §3.      |


**Radios:**

- Controles (`button`, `input`): **8–12px** (navbar/link; botones beneficiarios ~12px).
- Tarjetas medianas/reportes “shadcn”: **14px**.
- Tiles grandes tipo dashboard cards: hasta **24px** si se mantiene consistencia en una sola zona (dashboard).

### 2.6 Sombras y elevación

- **Navbar:** `0 1px 4px rgba(0,0,0,0.06)` — referencia de barra pegada arriba.
- **Tarjetas:** `shadcn` usa `0 8px 18px rgba(15,23,42,0.04)` — repetir ese patrón en nuevas superficies elevadas sobre `--color-surface-page`.

---

## 3. Patrones de layout

### 3.1 Página detrás del navbar (MainLayout + `.page-shell`)

`MainLayout` aplica **una sola “caja”** al contenido autenticado: un `<div className="page-shell">` alrededor del `<Outlet />`, definido en `client/src/index.css` (`max-width: 1480px`, centrado, `padding` 32×64 desktop y 16×20 en móvil).

**Rutas full-bleed** (sin shell, mantienen wizard/sidebar propio): `/prerregistro`, `/registro_beneficiario`.

**Encabezados de página:** usar `**.page-header-title`** (30px, peso 800) y `**.page-header-subtitle**` (16px) en `index.css`. Evitar segundo `margin` o `max-width` duplicado en la hoja de cada vista.

Las clases `.page-container` / `.content-container` quedan sin margen (compat); el spacing exterior lo resuelve solo `.page-shell`.

### 3.2 Login / pantalla aislada

La pantalla de login es **fullscreen** centrada (`login-page`): ok como **única plantilla especial** (`login.css`). No copiar ese patrón a páginas internas.

---

## 4. Componentes reutilizables

- `**Button`/acciones:** misma familia tipográfica, altura táctil recomendada **44–48px**, `border-radius: 12px` como línea ya usada en `Button.css`. Colores azul `#1e3b8a`/`#5169ac` → normalizar al token `--color-brand` y variantes `secondary/outline` con `#64748b` borde/texto cuando sea outline.
- **Tarjetas “tipo shadcn”:** usar clases `.shadcn-card*` (`shadcn-ui.css`) o duplicar **solo** después de refactor a variables compartidas.
- **Enlaces de navegación:** respetar estados `.link` / `.linkActive` del Navbar (rounded 8px, gris texto, soft indigo activo).

---

## 5. Accesibilidad y consistencia rápida

- Contraste texto normal ≥ **WCAG AA** sobre fondos `#f5f7fb` y `#ffffff`; evitar texto gris claro `#9ca3af` en cuerpo pequeño sin verificar ratio.
- **Focus visible:** no quitar outlines sin reemplazo; alinear hover/focus entre botón nativo y `button`/`.link`.
- `**#root`** usa `text-align: initial` en `App.css` para no centrar todo el árbol por defecto.

---

## 6. Mapa actual de fuentes CSS (orientación al refactor)

Solo cliente — útil por **comunidades de estilo**:


| Área                     | Archivos representativos                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Global / plantilla base  | `client/src/index.css`, `App.css`                                                                                  |
| Navegación               | `Navbar.module.css` (Montserrat)                                                                                   |
| Dashboard                | `pages/styles/dashboard.css` (Arial, `#2847a8`)                                                                    |
| Login                    | `pages/styles/login.css` (Arial, azules propios `#25449c`)                                                         |
| Beneficiarios / registro | `GestionBeneficiarios.css`, `Beneficiario*.module.css`, `Button.css`, `BusquedaBeneficiarioVista.css`              |
| Inventario               | `Inventario.css`, `Inventario*.module.css`                                                                         |
| Reportes                 | `Reportes.css`, `Reporte*.css`, muchos componentes `reportes/**/*/*.css`, `reportePersonalizado.ledger.chrome.css` |
| UI compartido            | `shadcn-ui.css`, `Pagination.module.css`, `Dropdown.css`, `SearchBar.css`                                          |


**Hallazgos de deriva típica:**

- Varias variantes de **azul marca**/`indigo`: `#2847a8`, `#25449c`, `#2f5bd3`, `#1E3B8A`, `#1e3a8a`, `#5169ac`.
- **Fondo página** entre `#f4f6fa`, `#f5f7fb`, `#f7f8fb`, `#f3f5f9`.
- **Tipografía**: Montserrat sólo navbar; otras vistas Arial / `inherit`.

---



