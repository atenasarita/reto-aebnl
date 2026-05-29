---
name: ASEB NL Admin
description: Sistema administrativo claro y confiable para la operación diaria de la Asociación Espina Bífida de Nuevo León
colors:
  brand-primary: "#1E3B8A"
  brand-hover: "#1D4ED8"
  brand-soft: "#E0E7FF"
  brand-secondary: "#5474BC"
  accent-warm: "#F4A300"
  success: "#1F9D55"
  surface-page: "#f5f7fb"
  surface-card: "#ffffff"
  surface-muted: "#f8fafc"
  border-soft: "#e2e8f0"
  border-strong: "#dbe3ee"
  text-primary: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#64748b"
  icon-muted: "#6b7280"
  error: "#dc2626"
  error-soft: "#fee2e2"
typography:
  display:
    fontFamily: "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1.3
  body:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Montserrat, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.06em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  control: "12px"
  nav-link: "8px"
  card: "14px"
  tile: "24px"
  badge: "20px"
spacing:
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-16: "64px"
components:
  button-primary:
    backgroundColor: "{colors.brand-primary}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 28px"
    height: "44px"
  button-secondary:
    backgroundColor: "#f1f1f4"
    textColor: "#3d4565"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "44px"
  input-field:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "44px"
  nav-link-active:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-primary}"
    rounded: "{rounded.nav-link}"
    padding: "8px 16px"
  card-surface:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.card}"
    padding: "18px"
---

# Design System: ASEB NL Admin

## 1. Overview

**Creative North Star: "The Care Operations Desk"**

Este sistema visual sirve a personal administrativo que registra beneficiarios, servicios, inventario y finanzas en una oficina bien iluminada, con sesiones largas y interrupciones frecuentes. La interfaz debe sentirse **operativa, legible y calmada**: confianza institucional sin frialdad corporativa, densidad útil sin ruido decorativo.

La estrategia de color es **Restrained**: neutros slate tintados hacia el azul de marca, con acento azul institucional en acciones primarias y acento ámbar reservado para destacados puntuales (dashboard). La tipografía es una sola familia sans (Montserrat) con contraste de peso, no de fuente display. El layout autenticado vive dentro de `.page-shell` (max-width 1480px, padding 32×64 desktop) bajo una navbar sticky blanca.

Rechazamos explícitamente: plantillas SaaS genéricas (hero-metrics de tres tarjetas idénticas, gradientes decorativos, glassmorphism), animaciones coreografiadas al cargar, side-stripe borders en alertas, y la mezcla caótica de azules o fuentes (Arial vs Montserrat) que aún persiste en módulos legacy.

**Key Characteristics:**

- Una familia tipográfica (Montserrat) con escala fija en rem/px, no fluida
- Tokens CSS en `:root` (`client/src/index.css`) como fuente normativa
- Controles táctiles de 44–48px de altura, radios 12px en inputs y botones
- Elevación sutil: sombras apenas perceptibles; profundidad por borde + contraste tonal
- Formularios con labels uppercase pequeños; tablas densas para datos operativos
- Español como idioma de interfaz; copy directo, sin jerga técnica innecesaria

## 2. Colors

Paleta institucional slate + azul profundo, con acento cálido usado con moderación.

### Primary

- **Institutional Deep Blue** (#1E3B8A): CTAs primarios, enlaces activos de navbar, focus rings, valores monetarios destacados. Token: `--color-brand`.
- **Interactive Blue Lift** (#1D4ED8): hover sobre primario. Token: `--color-brand-hover`.
- **Soft Indigo Wash** (#E0E7FF): fondo de nav activo, chips suaves. Token: `--color-brand-soft`.

### Secondary

- **Supporting Steel Blue** (#5474BC): acentos secundarios de marca donde el primario sería demasiado pesado. Token: `--color-brand-secondary`.

### Tertiary

- **Warm Action Amber** (#F4A300): acentos de dashboard y badges de donación. Usar con moderación, no como color de botón primario global. Token: `--color-accent`.

### Neutral

- **Page Mist** (#f5f7fb): fondo de página autenticada. Token: `--color-surface-page`.
- **Card White** (#ffffff): tarjetas, navbar, inputs. Token: `--color-surface-card`.
- **Ink Primary** (#0f172a): títulos y texto principal. Token: `--color-text-primary`.
- **Ink Secondary** (#475569): cuerpo y navegación inactiva. Token: `--color-text-secondary`.
- **Ink Muted** (#64748b): subtítulos, hints, metadatos. Token: `--color-text-muted`.
- **Border Soft** (#e2e8f0): bordes de inputs, tarjetas, divisores. Token: `--color-border`.
- **Success Green** (#1F9D55 / #16a34a en módulos financieros): estados positivos, abonos. Token: `--color-success` / `--green` local en Recibos.
- **Error Red** (#dc2626): validación, alertas. Fondo suave `#fee2e2`.

### Named Rules

**The One Blue Rule.** En cualquier pantalla autenticada nueva, un solo azul de marca (`--color-brand`). No introducir `#2847a8`, `#25449c`, `#5169ac` u otras variantes legacy sin migrar al token.

**The Accent Sparingly Rule.** El ámbar (`--color-accent`) aparece en dashboard y badges semánticos, no en botones primarios ni fondos grandes.

## 3. Typography

**Display Font:** Montserrat (system-ui fallback)  
**Body Font:** Montserrat (system-ui fallback)  
**Label/Mono Font:** Montserrat para labels; JetBrains Mono para cifras financieras tabulares

**Character:** Sans humanista-geometrica, pesos 400–800. Confiable y legible en tablas densas; títulos con peso 800 y tracking ligeramente negativo en H1 de página.

### Hierarchy

- **Display** (800, 30px, line-height 1.15): título de página (`.page-header-title`). Solo uno por vista.
- **Headline** (700, 20px): títulos de sección (`.section-title`, H2).
- **Title** (800, 18px): títulos de tarjeta shadcn (`.shadcn-card-title`).
- **Body** (400–500, 14–16px, line-height 1.5): contenido, celdas de tabla, subtítulos de página. Máximo ~75ch en bloques de prosa.
- **Label** (700, 12px, letter-spacing 0.06em, uppercase): `.fieldLabel`, headers de tabla, badges.

### Named Rules

**The Single Sans Rule.** Montserrat en todo el árbol autenticado. Login puede mantener escala display propia como excepción documentada; no copiar ese patrón a páginas internas.

**The Weight-Not-Size Rule.** Jerarquía por peso (400 vs 700 vs 800) más que por saltos extremos de tamaño. Ratio ~1.25 entre pasos.

## 4. Elevation

Sistema **mayormente plano con elevación de estado**. Las superficies en reposo usan borde (`--color-border`) y fondo blanco sobre page mist; las sombras son difusas y de bajo contraste, reservadas para navbar sticky y tarjetas shadcn elevadas.

### Shadow Vocabulary

- **Navbar anchor** (`0 1px 4px rgba(0,0,0,0.06)`): única sombra estructural persistente en la barra superior. Token: `--shadow-navbar`.
- **Card lift** (`0 8px 18px rgba(15,23,42,0.04)`): tarjetas shadcn y superficies elevadas sobre fondo de página. Token: `--shadow-card`.
- **Focus ring** (`0 0 0 3px rgba(30,64,175,0.14–0.28)`): no es sombra de elevación; indicador de foco en inputs y botones primarios.

### Named Rules

**The Flat-By-Default Rule.** Sin sombra en filas de tabla, secciones de formulario ni contenedores anidados. Profundidad por espaciado y borde, no por capas de card dentro de card.

**The No Choreography Rule.** Las animaciones existentes en Recibos (`recibos-fade-*`) son legacy; vistas nuevas no deben añadir secuencias de entrada escalonadas.

## 5. Components

### Buttons

- **Shape:** Esquinas suaves (12px / `--radius-control`), altura mínima 44px
- **Primary:** Fondo `--color-brand`, texto blanco, peso 700, padding 0 28px (`.btnPrimary`, `.buscar-beneficiarios-btn`)
- **Hover / Focus:** Fondo `--color-brand-hover`; focus-visible con ring azul 3px, sin quitar outline sin reemplazo
- **Secondary:** Fondo `#f1f1f4`, texto `#3d4565`, peso 600 (`.btnSecondary`)
- **Disabled:** opacity 0.5–0.6, cursor not-allowed

### Chips / Badges

- **Style:** Pill (border-radius 20px), 11px uppercase bold, padding 3px 10px
- **State:** Variantes semánticas por fondo suave + texto saturado (efectivo verde, tarjeta azul, donación ámbar, egreso rojo)

### Cards / Containers

- **Corner Style:** 14px (`--radius-card`) en shadcn; 16px en resumen legacy
- **Background:** `--color-surface-card` sobre `--color-surface-page`
- **Shadow Strategy:** `--shadow-card` solo en `.shadcn-card`; secciones operativas (Recibos, Donaciones) preferentemente sin card anidada
- **Border:** 1px `--color-border`
- **Internal Padding:** 18px en shadcn; 16–24px en paneles operativos

### Inputs / Fields

- **Style:** Borde 1px `--color-border`, fondo blanco, radio 12px, altura 44–48px, placeholder muted
- **Focus:** Borde `--color-brand`, ring `0 0 0 3px rgba(30,64,175,0.14)`
- **Error:** Borde `#dc2626`, mensaje 13px rojo debajo del campo (`aria-describedby`)
- **Label:** `.fieldLabel` uppercase 12px, gap 8px al control
- **Nota:** `SearchBar` es para búsqueda con debounce; campos de formulario usan `.input` nativo

### Navigation

- **Style:** Navbar sticky 120px, fondo blanco, borde inferior, logo + links horizontales
- **Typography:** 14px, peso 500 inactivo / 600 activo
- **Default / Active:** Inactivo `--color-text-secondary`; activo fondo `--color-brand-soft` + texto `--color-brand`, radio 8px
- **Mobile:** Menú colapsable (ver Navbar.module.css breakpoints)

### Tables (signature pattern)

- **Style:** Full width, 14px, headers uppercase 12px sobre fondo `#f8fafc`
- **Rows:** Borde inferior suave, hover sutil en módulos financieros
- **Numeric columns:** JetBrains Mono, alineación derecha, color semántico en montos (+ verde, − rojo)

## 6. Do's and Don'ts

### Do:

- **Do** usar variables de `client/src/index.css` para color, espaciado y radios en vistas nuevas
- **Do** usar `.page-header-title` y `.page-header-subtitle` para encabezados de página autenticada
- **Do** mantener controles interactivos a ≥44px de altura en touch targets
- **Do** validar formularios con mensajes inline junto al campo y `aria-invalid`
- **Do** preferir layout de dos columnas (acción + historial) en flujos financieros operativos
- **Do** respetar `prefers-reduced-motion` en animaciones de carga o spinner

### Don't:

- **Don't** usar la plantilla hero-metric (tres tarjetas idénticas con número grande + label pequeño)
- **Don't** usar `SearchBar` como input genérico de formulario sin autocompletado real
- **Don't** añadir animaciones fade escalonadas al cargar páginas (`recibos-fade-panel`, `recibos-fade-up`)
- **Don't** usar border-left/right >1px como acento de color en cards, alertas o list items
- **Don't** introducir nuevos hex de azul o gris fuera de la escala documentada
- **Don't** mezclar Arial en páginas internas cuando Montserrat es la familia canónica
- **Don't** anidar cards dentro de cards; una superficie por nivel de jerarquía
- **Don't** usar gradient text, glassmorphism decorativo, ni modales como primera opción de UX
