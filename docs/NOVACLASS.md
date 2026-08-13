# Documentación Oficial de NovaClass

> Documento generado a partir de una auditoría exhaustiva del código fuente presente en el repositorio, en su estado actual. No refleja historial de versiones anteriores ni funcionalidades planeadas fuera de lo que el código evidencia.

---

## 1. Introducción

NovaClass es una plataforma académica web, construida sobre Next.js (App Router), pensada para que un estudiante organice en un solo lugar su horario de clases, sus tareas personales, el trabajo colaborativo en equipos ("TeamClass"), un calendario unificado de fechas importantes y un dashboard personalizable con widgets informativos.

La aplicación es de un solo perfil de usuario (no distingue roles de "profesor" vs "alumno" en el modelo de datos ni en la interfaz): cualquier cuenta autenticada con Google tiene acceso a las mismas funcionalidades, sujeto únicamente al estado de su suscripción de pago.

El acceso a la aplicación requiere dos condiciones acumulativas, verificadas en cada carga del layout autenticado (`src/app/(app)/layout.tsx`):

1. Haber iniciado sesión con una cuenta de Google (Firebase Authentication).
2. Tener una suscripción activa (S/ 3.00 mensuales, gestionada con Stripe).

## 2. Objetivos del producto (según lo implementado)

A partir de los módulos existentes, el código evidencia los siguientes objetivos funcionales:

- Centralizar el horario semanal de clases de un estudiante (bloques, recreos, cursos con color propio).
- Centralizar la gestión de tareas personales, con estado, curso asociado y fecha de entrega.
- Permitir trabajo colaborativo por proyecto a través de grupos identificados por un código numérico de 4 dígitos ("TeamClass"), con tareas grupales independientes de las tareas personales.
- Unificar en un calendario mensual todo lo que tiene fecha: tareas personales, tareas grupales, cuentas regresivas y cumpleaños configurados en el dashboard.
- Ofrecer un dashboard configurable con widgets informativos y decorativos (reloj, fecha, cumpleaños, racha de productividad, etc.).
- Monetizar el acceso mediante una suscripción recurrente única (sin niveles ni planes alternativos).

## 3. Filosofía del producto

El código revela un enfoque de "aplicación personal ligera": no existe una jerarquía de administración, no hay roles, no hay moderación de contenido, no hay onboarding institucional (colegios, aulas, docentes). Todo gira en torno al usuario individual y, en el caso de TeamClass, en torno a grupos pequeños (máximo 10 integrantes) autogestionados sin jerarquía formal más allá de un "líder" con permiso de expulsión.

El diseño visual (ver sección 8) refuerza esta filosofía: superficies blancas, mucho aire, animaciones sutiles y constantes (`framer-motion`), y una paleta de azules como identidad de marca ("Nova" = eléctrico/azul).

## 4. Público objetivo

El texto de la interfaz (en español, tono cercano — "Organiza tu vida académica en un solo lugar", límites de edad de 1 a 50 años en el onboarding, moneda en Soles peruanos "S/ 3.00") indica que el público objetivo son estudiantes de habla hispana, probablemente de Perú dado el uso explícito de soles como moneda de suscripción.

## 5. Tecnologías utilizadas

### 5.1 Stack principal

| Categoría | Tecnología | Versión (package.json) |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.0 |
| UI | React / React DOM | 19.2.8 |
| Lenguaje | TypeScript (`strict: true`) | ^5 |
| Estilos | Tailwind CSS (CSS-first, sin `tailwind.config.*`) | ^4 (`@tailwindcss/postcss`) |
| Animación | Framer Motion | ^13.0.0 |
| Backend as a Service | Firebase (client SDK: Auth, Firestore, Storage) | ^12.17.1 |
| Backend admin | firebase-admin (Auth, Firestore) | ^14.2.0 |
| Pagos | Stripe (`stripe` server SDK) | ^22.4.0 |
| Pagos (cliente) | `@stripe/stripe-js` | ^9.13.0 (declarada como dependencia; no se detectó uso directo en el código — el flujo de pago actual redirige por URL a Stripe Checkout, no usa Stripe Elements/`loadStripe`) |
| Drag & drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` | 6.3.1 / 10.0.0 / 3.2.2 |
| Gráficos | Recharts | ^3.10.1 |
| Iconografía | lucide-react | ^1.28.0 |
| Slider accesible | `@radix-ui/react-slider` | ^1.4.7 |
| Números animados | `@number-flow/react` | ^0.6.2 |
| Exportación de imágenes | `html-to-image` | ^1.11.13 |
| Exportación de PDF | `jspdf` | ^4.2.1 |
| Linter | ESLint 9 (flat config) + `eslint-config-next` | ^9 / 16.3.0 |

No existe ningún framework ni librería de testing en `package.json` (no hay Jest, Vitest, Testing Library, Playwright ni Cypress). No hay directorio `__tests__` ni archivos `*.test.*`/`*.spec.*` en el repositorio.

### 5.2 Nota importante sobre la versión de Next.js

Este proyecto usa Next.js 16, que introduce cambios que rompen compatibilidad respecto a versiones anteriores. El más relevante para la arquitectura de este repositorio es el reemplazo del archivo `middleware.ts` por **`proxy.ts`** (`src/proxy.ts`), documentado en `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`. Todo el control de acceso a nivel de borde (edge) de NovaClass está implementado sobre esta nueva convención.

## 6. Arquitectura general

NovaClass sigue una arquitectura **mayormente "serverless / BaaS"**: la gran mayoría de las operaciones CRUD de la aplicación (tareas, cursos, horario, widgets, grupos, tareas grupales) se realizan **directamente desde el cliente hacia Cloud Firestore**, usando el SDK cliente de Firebase (`firebase/firestore`), sin pasar por una API REST propia. La autorización de esas operaciones recae por completo en las **Firestore Security Rules** (`firestore.rules`), no en código de servidor.

Solo existen **6 endpoints de servidor** (`src/app/api/**/route.ts`), todos ellos relacionados con dos únicos dominios sensibles que no pueden confiarse al cliente:

- Autenticación / sesión (`/api/auth/session`)
- Suscripción y pagos con Stripe (`/api/onboarding/complete`, `/api/stripe/checkout`, `/api/stripe/confirm`, `/api/stripe/reactivate`, `/api/stripe/webhook`)

Esto es deliberado: el documento de perfil de usuario (`users/{uid}`) tiene `allow write: if false;` en las reglas de Firestore — **ningún cliente puede escribir directamente su propio perfil**. Todas las mutaciones de perfil (creación, datos de onboarding, estado de suscripción) pasan por rutas de servidor que usan `firebase-admin`, el cual **no está sujeto a las Firestore Security Rules**. Este es el límite de seguridad central de la aplicación: nadie puede autoconcederse una suscripción activa manipulando el cliente.

### 6.1 Doble capa de verificación de sesión

1. **`src/proxy.ts`** (se ejecuta en cada request, según el matcher `["/((?!api|_next/static|_next/image|.*\\..*).*)"]`): solo comprueba la **presencia** de la cookie `novaclass_session`, sin validarla criptográficamente. Redirige:
   - `/` → `/dashboard` si hay cookie, `/login` si no.
   - Rutas públicas (`/login`) → `/dashboard` si ya hay cookie.
   - Cualquier otra ruta → `/login` si no hay cookie.
2. **`getSessionUser()`** (`src/lib/auth/session.ts`, marcado `server-only`): usado dentro de Server Components (`page.tsx`, `layout.tsx`) y rutas API. Verifica criptográficamente la cookie de sesión contra Firebase Admin (`verifySessionCookie(cookie, true)`, con comprobación de revocación), y es la que realmente decide si el usuario está autenticado a efectos de negocio.

Esta separación existe porque `proxy.ts` corre en un entorno más restringido (edge-like) donde no conviene/tampoco es necesario invocar el SDK completo de Admin en cada request; la verificación fuerte ocurre en el momento de renderizar cada página protegida.

### 6.2 Diagrama de capas

```
Cliente (React, "use client")
   │
   ├── Firebase Auth (client SDK) ─── estado de sesión en el navegador (useAuth())
   │
   ├── Firestore (client SDK) ──────── CRUD directo de: tasks, courses, schedule,
   │                                    dashboardWidgets, groups, group tasks
   │                                    (autorizado por firestore.rules)
   │
   └── fetch() a /api/** ──────────── solo para: login/logout (cookie de sesión),
                                        onboarding, checkout, confirmación y
                                        reactivación de pago, webhook de Stripe

Servidor (Route Handlers + Server Components, "server-only")
   │
   ├── firebase-admin ──────────────── verifica sesión, crea/lee/actualiza el
   │                                    perfil de usuario (bypassa las reglas)
   │
   └── stripe (SDK server) ─────────── crea clientes, sesiones de checkout,
                                         valida webhooks firmados
```

## 7. Estructura del proyecto

```
src/
├── proxy.ts                       # Reemplaza a middleware.ts (Next 16)
├── app/
│   ├── layout.tsx                 # Root layout: fuente Inter, <AuthProvider>
│   ├── globals.css                # Tokens de color Tailwind 4, keyframes puntuales
│   ├── page.tsx                   # "/" — redirect a /dashboard o /login
│   ├── login/                     # Pantalla de login (Google)
│   ├── onboarding/                # Wizard de 4 pasos post-login
│   ├── onboarding-flow-background.tsx  # Fondo compartido de las pantallas "pre-app"
│   ├── api/
│   │   ├── auth/session/route.ts
│   │   ├── onboarding/complete/route.ts
│   │   └── stripe/{checkout,confirm,reactivate,webhook}/route.ts
│   └── (app)/                     # Route group: shell autenticado
│       ├── layout.tsx             # Gate de sesión + onboarding + suscripción
│       ├── sidebar.tsx
│       ├── app-backdrop.tsx
│       ├── empty-state.tsx        # Componente reutilizado en varios módulos
│       ├── reactivate-view.tsx    # Paywall cuando la suscripción no está activa
│       ├── subscription-sync.tsx  # Reconciliación silenciosa post-pago
│       ├── dashboard/
│       ├── schedule/
│       ├── calendario/
│       ├── tareas/
│       ├── teamclass/
│       │   └── [code]/            # Ruta dinámica: detalle de un grupo
│       └── perfil/
└── lib/
    ├── auth/            # constants, session (server), auth-provider (client)
    ├── firebase/        # admin.ts (server-only), client.ts ("use client")
    ├── stripe/          # client.ts (proxy del SDK de Stripe, server-only)
    ├── users/           # profile.ts (server-only, usa firebase-admin), types.ts
    ├── dashboard/        # types, data (Firestore client), stats (cálculos puros)
    ├── schedule/         # types, data, timeline (algoritmo), colors
    ├── calendar/         # types, build-events, month-grid, colors, motion
    ├── tasks/             # types, data, format, sort
    ├── teamclass/         # types, data, sort
    └── hooks/             # use-click-outside, use-media-query
```

Convención observada en todo el repositorio: cada módulo de dominio (`dashboard`, `schedule`, `calendar`, `tasks`, `teamclass`, `users`) tiene su propio `types.ts` (interfaces TypeScript que reflejan 1:1 los documentos de Firestore) y, cuando aplica, un `data.ts` con las funciones de acceso a datos (Firestore) y utilidades de cálculo puro separadas (`stats.ts`, `sort.ts`, `format.ts`, `timeline.ts`).

## 8. Sistema de diseño

### 8.1 Identidad visual y paleta de colores

Definida en `src/app/globals.css` mediante el bloque `@theme inline` de Tailwind CSS 4 (no existe `tailwind.config.js/ts` — la configuración de tema es 100% CSS-first):

| Token | Hex | Uso |
|---|---|---|
| `--color-nova-electric` | `#0A6DFD` | Color de marca principal; CTAs, gradientes, acentos |
| `--color-nova-intermediate` | `#2F94FD` | Punto medio de gradientes marca |
| `--color-nova-sky` | `#57B9FD` | Acento claro, halos decorativos |
| `--color-nova-navy` | `#040E3C` | Color de texto/neutro base — **toda la escala de grises de la app es este color a distintas opacidades** (`text-nova-navy/50`, `/40`, `/30`…), no existe una escala de grises independiente |
| `--color-nova-white` | `#FFFFFF` | Fondo base de tarjetas y superficies |

Fuente tipográfica única: **Inter** (Google Font vía `next/font/google`), expuesta como variable CSS `--font-inter` y mapeada a `--font-sans`. No hay tipografía secundaria ni de despliegue ("display").

Iconografía: exclusivamente **lucide-react**. Las únicas excepciones son un ícono de Google dibujado a mano en SVG (`login-view.tsx`, cumpliendo el branding oficial de "Iniciar sesión con Google") y el logotipo propio `public/logo-mark.png`.

### 8.2 Paleta de colores de cursos

Independiente de la paleta de marca, `src/lib/schedule/colors.ts` define **15 colores fijos** que el usuario elige al crear un curso (`electric`, `sky`, `navy`, `indigo`, `violet`, `fuchsia`, `rose`, `coral`, `orange`, `amber`, `lime`, `emerald`, `teal`, `cyan`, `slate`). Cada curso se renderiza como una "píldora" con fondo al 14% de opacidad, borde al 32% y texto en el color pleno (`getCourseStyle()`, vía `hexToRgba()`), reutilizada tal cual en Schedule, Mis Tareas, Calendario y en el widget "Colección de cursos" del Dashboard — es el mecanismo de color más reutilizado de toda la aplicación.

Colores semánticos fijos exclusivos del Calendario (`src/lib/calendar/colors.ts`), elegidos para no colisionar con ninguno de los 15 colores de curso:

- `TEAMCLASS_COLOR` `#A16207` (ámbar/marrón) — eventos de tareas grupales.
- `COUNTDOWN_COLOR` `#334155` (pizarra) — eventos de countdown.
- `BIRTHDAY_COLOR` `#EF6FA8` (rosa) — eventos de cumpleaños.
- `NEUTRAL_COLOR` `#040E3C` — tareas sin curso asociado (estilo punteado/neutro).

### 8.3 Animación

**Framer Motion** se usa de forma sistemática en prácticamente todos los componentes interactivos: transiciones de entrada/salida (`AnimatePresence`), micro-interacciones (`whileHover`, `whileTap`), y ambientaciones continuas (blobs de fondo, brillos, partículas). La curva de easing `[0.22, 1, 0.36, 1]` se repite como constante local (`const EASE = ...`) en más de una decena de archivos; solo el módulo Calendario la centraliza en un módulo compartido (`src/lib/calendar/motion.ts`, junto con `CARD_SHADOW`).

Lenguaje visual de tarjeta compartido en casi todos los módulos: esquinas `rounded-3xl` (24px), fondo blanco, y una sombra compuesta de tres capas (highlight interior + sombra ajustada + sombra ambiental de 40px de difuminado), repetida como clase arbitraria de Tailwind en cada componente de tarjeta (`widget-card.tsx`, tarjetas de Schedule/TeamClass/Calendario, etc.).

Dos capas de fondo decorativo, ambas `aria-hidden` y `pointer-events-none`:

- **`AppBackdrop`** (`src/app/(app)/app-backdrop.tsx`): detrás de todo el shell autenticado — blobs radiales animados, trazos SVG sutiles, partículas y una marca de agua del logo al 3% de opacidad.
- **`OnboardingFlowBackground`** (`src/app/onboarding-flow-background.tsx`): una única imagen (`public/onboarding-bg.png`) con una deriva lenta y desincronizada de traslación/escala/inclinación, usada detrás de Login, Onboarding y el mini-onboarding de Schedule.

### 8.4 Recursos gráficos en `public/`

| Archivo | Uso |
|---|---|
| `logo-mark.png` | Logo de la app (sidebar, marca de agua del fondo) |
| `onboarding-bg.png` | Fondo de las pantallas de login/onboarding |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Plantillas por defecto de `create-next-app`; **no se encontró ninguna referencia a estos archivos en el código fuente** — son artefactos sin uso (ver sección 27). |

## 9. Autenticación

Autenticación federada exclusiva con **Google**, vía Firebase Authentication (`GoogleAuthProvider`, `signInWithPopup`). No existe registro con correo/contraseña ni ningún otro proveedor.

### 9.1 Flujo de inicio de sesión

1. El usuario pulsa "Continuar con Google" en `LoginView` (`src/app/login/login-view.tsx`), que invoca `signInWithGoogle()` del `AuthProvider` (`src/lib/auth/auth-provider.tsx`).
2. Firebase Auth (cliente) abre el popup de Google y devuelve un `idToken`.
3. El cliente hace `POST /api/auth/session` con `{ idToken }`.
4. La ruta de servidor (`src/app/api/auth/session/route.ts`):
   - Verifica el `idToken` con `getAdminAuth().verifyIdToken(...)`.
   - Llama a `ensureUserProfile(uid, { email, photoURL, name })` (`src/lib/users/profile.ts`), que crea el documento `users/{uid}` **solo si no existe** (perfil inicial con `onboardingCompleted: false`, `subscription.status: "none"`).
   - Crea una cookie de sesión de Firebase (`createSessionCookie`, 14 días de validez) y la fija como cookie HTTP-only llamada `novaclass_session` (`httpOnly`, `secure` en producción, `sameSite: "lax"`).
5. El cliente llama `router.refresh()` para que el Server Component vuelva a evaluar el estado de sesión.

### 9.2 Cierre de sesión

`signOut()` hace `DELETE /api/auth/session` (borra la cookie), cierra sesión en el SDK cliente de Firebase, y redirige a `/login`.

### 9.3 Estado de sesión en el cliente vs. en el servidor

Existen **dos fuentes de verdad de sesión, deliberadamente paralelas**:

- **Cliente**: `AuthProvider` escucha `onAuthStateChanged` del SDK de Firebase Auth y expone `useAuth()` (`{ user, loading, signInWithGoogle, signOut }`) — es lo que usan **todos** los componentes cliente de la app para saber el `uid` actual y hacer consultas a Firestore.
- **Servidor**: la cookie `novaclass_session`, verificada con `getSessionUser()` — es lo que usan los Server Components (páginas, layout) y las rutas API.

No están acopladas por un mismo mecanismo: si la cookie de sesión expirase sin que el usuario cierre explícitamente sesión en el cliente, el estado de Firebase Auth en el navegador podría seguir "autenticado" mientras el servidor ya no reconoce la sesión (las páginas server-gated redirigirían a `/login` en la siguiente navegación/recarga).

### 9.4 Protección de rutas

- `src/proxy.ts`: primera línea de defensa (presencia de cookie).
- `src/app/(app)/layout.tsx`: gate real, con tres verificaciones en cascada:
  1. `getSessionUser()` — si no hay sesión válida, `redirect("/login")`.
  2. `getUserProfile(uid).onboardingCompleted` — si es falso, `redirect("/onboarding")`.
  3. `profile.subscription.status !== "active"` — si es cierto, se renderiza `<ReactivateView />` (paywall) en vez del shell de la app.
- `src/app/onboarding/page.tsx`: si no hay sesión, `redirect("/login")`; si el onboarding ya está completo, `redirect("/dashboard")`.
- `src/app/(app)/perfil/page.tsx`: si no hay sesión, `redirect("/login")`; si no existe perfil, `redirect("/onboarding")`.

## 10. Suscripción y pagos (Stripe)

### 10.1 Modelo de suscripción

Un único plan: **S/ 3.00 al mes** (texto fijo en la interfaz), sin niveles ni upgrades. El estado se modela en `UserProfile.subscription` (`src/lib/users/types.ts`):

```ts
type SubscriptionStatus = "none" | "active" | "past_due" | "canceled";

interface UserSubscription {
  status: SubscriptionStatus;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: number | null; // epoch ms
}
```

### 10.2 Flujo de alta (onboarding → pago)

Ver también sección 11 (Onboarding). El paso de pago (`POST /api/stripe/checkout`, `src/app/api/stripe/checkout/route.ts`) hace lo siguiente:

1. Guarda `name`/`age` en el perfil vía `updateOnboardingDetails` (Admin SDK).
2. **Si faltan credenciales de Stripe** (`STRIPE_PRICE_ID`, `STRIPE_SECRET_KEY` o `NEXT_PUBLIC_APP_URL`), **activa la suscripción directamente sin cobrar** (`status: "active"`, sin IDs de Stripe) y responde `{ bypass: true }`. Esto está documentado explícitamente en un comentario del propio código como un atajo para no bloquear el desarrollo local. **Ver sección 26 — riesgo si se despliega a producción sin las variables configuradas.**
3. Si hay credenciales, crea (o reutiliza) un `Customer` de Stripe y una `Checkout Session` en modo `subscription`, con `success_url` de vuelta a `/onboarding?session_id={CHECKOUT_SESSION_ID}` y `cancel_url` a `/onboarding?payment=cancelled`. El `uid` viaja en `metadata.uid` tanto de la sesión de checkout como de la suscripción.
4. El cliente redirige el navegador completo (`window.location.href`) a la URL de Stripe Checkout.

### 10.3 Confirmación de pago

Al volver de Stripe con `?session_id=...`, tanto `OnboardingView` como `SubscriptionSync` (usado dentro del shell autenticado para reactivaciones) llaman `POST /api/stripe/confirm` con ese id. La ruta (`src/app/api/stripe/confirm/route.ts`):

- Recupera la `Checkout Session` de Stripe (expandiendo `subscription`).
- **Verifica que `checkoutSession.metadata.uid` coincida con el usuario de la sesión actual** — evita que un usuario confirme/asocie el pago de otra persona.
- Si `status === "complete"`, actualiza `subscription` en el perfil con el `customerId`, `subscriptionId` y `currentPeriodEnd` (convertido de segundos Unix a milisegundos).

### 10.4 Finalización del onboarding

`POST /api/onboarding/complete` (`src/app/api/onboarding/complete/route.ts`) es el único punto que marca `onboardingCompleted: true`, y **vuelve a comprobar en servidor** que `subscription.status === "active"` antes de permitirlo — un usuario no puede saltarse el pago manipulando el cliente para llegar directo al dashboard.

### 10.5 Reactivación

Cuando la suscripción no está activa, el shell autenticado muestra `ReactivateView` (`src/app/(app)/reactivate-view.tsx`) en lugar de la aplicación. Su botón llama `POST /api/stripe/reactivate`, que crea una nueva Checkout Session (reutilizando el `stripeCustomerId` si existe) con retorno a `/dashboard`. `SubscriptionSync` (montado junto al paywall) detecta el `session_id` de vuelta y llama a `/api/stripe/confirm` silenciosamente, refrescando la página al terminar.

### 10.6 Webhook

`POST /api/stripe/webhook` (`src/app/api/stripe/webhook/route.ts`) es la única vía por la que el estado de suscripción se mantiene sincronizado **sin depender de que el usuario tenga el navegador abierto** (renovaciones, impagos, cancelaciones):

- Verifica la firma (`stripe.webhooks.constructEvent`, con `STRIPE_WEBHOOK_SECRET`).
- Escucha `customer.subscription.created|updated|deleted`.
- Resuelve el `uid` destino desde `subscription.metadata.uid`, o —si falta— buscando por `stripeCustomerId` en Firestore (`getUserByStripeCustomerId`, consulta `where("subscription.stripeCustomerId", "==", ...)`).
- Traduce el estado de Stripe al estado interno: `active`/`trialing` → `active`; `past_due`/`unpaid` → `past_due`; cualquier otro (`canceled`, `incomplete_expired`, etc.) → `canceled`.

## 11. Onboarding

Wizard de 4 pasos (`src/app/onboarding/onboarding-view.tsx`), accesible solo tras iniciar sesión y antes de completar el onboarding:

1. **Nombre** — campo de texto libre, obligatorio.
2. **Edad** — `NumberFlowSlider` (Radix Slider + `@number-flow/react` para la animación numérica), rango 1–50, valor por defecto 10.
3. **Pago** — botón "Pagar y continuar"; dispara el flujo de la sección 10.2. Si el usuario vuelve con `?payment=cancelled`, se le regresa a este paso con un mensaje de error.
4. **Bienvenida** — confirma el nombre ingresado y finaliza el onboarding (sección 10.4), redirigiendo a `/dashboard`.

Tras completar el onboarding de cuenta, el primer acceso a **Schedule** dispara un segundo wizard independiente y obligatorio antes de poder usar ese módulo (ver sección 13.2).

## 12. Base de datos y persistencia (Firestore)

No hay una base de datos relacional ni un ORM: **Cloud Firestore** es la única base de datos, con un modelo de documentos por usuario (subcolecciones bajo `users/{uid}`) y un espacio compartido para grupos (`groups/{code}`).

### 12.1 Mapa completo de colecciones

| Ruta | Contenido | Escrito por |
|---|---|---|
| `users/{uid}` | `UserProfile` (perfil, onboarding, suscripción) | **Solo servidor** (`firebase-admin`, vía `src/lib/users/profile.ts`) |
| `users/{uid}/courses/{courseId}` | `Course` (cursos del horario) | Cliente |
| `users/{uid}/schedule/config` | `ScheduleConfig` (bloques, recreos, hora de inicio) | Cliente |
| `users/{uid}/schedule/assignments` | `ScheduleAssignments` (mapa celda → curso) | Cliente |
| `users/{uid}/tasks/{taskId}` | `Task` (tareas personales) | Cliente |
| `users/{uid}/groupMemberships/{groupId}` | `GroupMembership` (índice inverso: en qué grupos estoy) | Cliente (propio usuario o cualquier miembro del grupo referenciado) |
| `users/{uid}/dashboard/config` | `DashboardConfig` (orden de los 3 widgets fijos) | Cliente |
| `users/{uid}/dashboardWidgets/{widgetId}` | `Widget` (widgets personalizables del dashboard) | Cliente |
| `groups/{code}` | `Group` (código de 4 dígitos, líder, integrantes) | Cliente (bajo reglas estrictas, ver 12.3) |
| `groups/{code}/members/{uid}` | `GroupMember` (snapshot de nombre/foto al unirse) | Cliente |
| `groups/{code}/tasks/{taskId}` | `GroupTask` (tareas del proyecto grupal) | Cliente |

### 12.2 Persistencia: patrón general

Cada módulo expone funciones de acceso a datos en su `data.ts` (marcado `"use client"`) que envuelven llamadas directas al SDK de Firestore (`getDoc`, `getDocs`, `setDoc`, `updateDoc`, `addDoc`, `deleteDoc`, `writeBatch`, `runTransaction`, `onSnapshot`). No hay una capa de caché ni de sincronización offline configurada explícitamente más allá del comportamiento por defecto del SDK.

**Patrón de actualización optimista**: casi todas las vistas actualizan primero el estado local de React y, en paralelo, disparan la escritura en Firestore con `.catch(() => {})` (silenciando errores) — por ejemplo, en Schedule al soltar un curso en una celda, o en Mis Tareas al tildar una tarea. Esto prioriza una UI que se siente instantánea sobre la garantía estricta de consistencia; un fallo de red deja el estado local desincronizado del remoto hasta la siguiente recarga.

**Carga de datos**: la mayoría de vistas (Dashboard, Schedule, Mis Tareas) cargan datos una sola vez al montar (`useEffect` + `getDocs`/`getDoc`), sin listeners en tiempo real. La única vista con sincronización en **tiempo real** (`onSnapshot`) de punta a punta es **Calendario** (tareas, cursos, membresías de grupo, widgets, y una suscripción dinámica por cada tarea grupal de cada grupo activo) y, parcialmente, **TeamClass** (el detalle de un grupo específico usa `onSnapshot` sobre el grupo, sus miembros y sus tareas).

### 12.3 Reglas de seguridad (`firestore.rules`)

Resumen funcional de cada regla:

- **`users/{uid}`**: lectura solo por el propio dueño; **escritura totalmente bloqueada desde el cliente** (`allow write: if false`). Todas las subcolecciones (`courses`, `schedule`, `tasks`, `dashboard`, `dashboardWidgets`) sí permiten lectura/escritura al propio dueño.
- **`users/{uid}/groupMemberships/{groupId}`**: lectura solo por el dueño; escritura por el dueño **o por cualquier miembro actual del grupo referenciado** (`isGroupMember(groupId)`) — necesario porque crear/unirse/salir/expulsar de un grupo requiere escribir este documento en nombre de otro `uid` en algunos casos.
- **`groups/{groupId}`**:
  - `get`: cualquier usuario autenticado (si conoce el código).
  - `list`: **deshabilitado** (`allow list: if false`) — es imposible enumerar todos los grupos existentes; solo se puede acceder por código conocido.
  - `create`: solo si `leaderId` y `memberIds` del documento creado son exactamente `[quien crea]`.
  - `update`: permitido únicamente en tres patrones exactos, validados campo por campo comparando `resource.data` (antes) contra `request.resource.data` (después):
    1. **Unirse**: el solicitante no era miembro, se añade a sí mismo al final de `memberIds`, y el array resultante no supera 10 integrantes.
    2. **Auto-abandono**: un miembro actual se quita solo a sí mismo de `memberIds`.
    3. **Expulsión por el líder**: el líder permanece como líder, permanece en `memberIds`, y el array resultante tiene exactamente un integrante menos.
  - `delete`: cualquier miembro actual del grupo.
  - `groups/{groupId}/members/{uid}`: lectura por cualquier autenticado; escritura por el propio `uid` o por cualquier miembro del grupo (permite que el líder borre el documento de un expulsado).
  - `groups/{groupId}/tasks/{taskId}`: lectura/escritura restringida a miembros actuales del grupo.

Este es el corazón de la seguridad de la aplicación: como no existe una API de servidor para estas operaciones, **la regla de Firestore es la única barrera** contra un cliente malicioso que intente, por ejemplo, unirse a un grupo lleno, expulsar a alguien sin ser líder, o leer tareas de un grupo ajeno.

## 13. Módulo: Schedule (Horario)

### 13.1 Propósito

Permite construir el horario semanal de clases (lunes a viernes únicamente) del estudiante: bloques de duración fija, recreos, y una lista de cursos (con color) que se arrastran a las celdas del horario.

### 13.2 Onboarding de Schedule

Si el usuario no tiene un documento `schedule/config`, `ScheduleView` (`src/app/(app)/schedule/schedule-view.tsx`) renderiza `ScheduleOnboarding` (`schedule-onboarding.tsx`), un wizard de 5 pasos independiente del onboarding de cuenta:

1. Hora de inicio de la jornada (`<input type="time">`).
2. Cantidad de bloques (1–15, slider) y duración de cada uno en minutos (15–180).
3. Recreos (0–5), cada uno con hora de inicio y duración (5–60 min).
4. Confirmación (resumen textual).
5. Alta de cursos iniciales (nombre + color de una paleta de 15).

Al confirmar el paso 4 (`handleCreateSchedule`), se llama a `createSchedule()` (`src/lib/schedule/data.ts`), que ejecuta **dos `setDoc` secuenciales** (no una transacción): primero `schedule/config`, luego `schedule/assignments` (vacío). Los cursos del paso 5 se crean individualmente con `addCourse()` a medida que el usuario los añade.

### 13.3 Algoritmo de generación de la línea de tiempo

`generateTimeline()` (`src/lib/schedule/timeline.ts`) es el algoritmo central del módulo: a partir de `{ startTime, blockCount, blockDurationMinutes, recreos }` produce una lista ordenada de filas (`TimelineRow`), cada una de tipo `"block"` o `"recreo"`, con sus minutos de inicio/fin calculados.

Funcionamiento: se recorre secuencialmente cada bloque desde `startTime`; **antes de colocar cada bloque**, se insertan todos los recreos cuya hora de inicio configurada ya haya sido alcanzada por el reloj acumulado (`placeDueRecreos()`); cualquier recreo que quede pendiente tras el último bloque se añade al final. Es decir, **el recreo se ubica por su hora de reloj configurada, no por posición fija tras un número de bloque** — si los bloques anteriores ocupan más tiempo del previsto (lo cual no puede ocurrir en este modelo porque la duración de bloque es fija), o si dos recreos se configuran con horas muy próximas, el algoritmo no valida solapamientos.

### 13.4 Tablero (Schedule Board)

`ScheduleBoard` (`src/app/(app)/schedule/schedule-board.tsx`) renderiza una grilla de 5 columnas (Lunes–Viernes) × N filas (una por cada `block`/`recreo` de la línea de tiempo). Los cursos se muestran como "píldoras" arrastrables (`useDraggable` de `@dnd-kit`) desde una barra superior; cada celda de bloque es un destino de suelta (`useDroppable`). Al soltar, se persiste en `schedule/assignments.cells` bajo la clave `"{dayIndex}-{blockIndex}"` (`cellKey()`), mediante `assignCourseToCell()`. Las celdas de recreo no son destinos de suelta (no se les puede asignar curso).

Cada celda admite como máximo un curso; un mismo curso puede repetirse en múltiples celdas. Al pasar el cursor sobre una celda ocupada aparece un botón "×" para vaciarla (`clearCell()`).

### 13.5 Gestión de cursos

`CourseEditor` (modal) permite crear/editar nombre y color de un curso, y eliminarlo. **Eliminar un curso dispara una cascada real entre módulos**: `deleteCourse()` (`src/lib/schedule/data.ts`) —
1. Quita el curso de todas las celdas del horario en las que estaba asignado.
2. Elimina **todas las tareas personales** (`users/{uid}/tasks`) que tuvieran ese `courseId` (usando `findTasksLinkedToCourses`, que consulta en bloques de 10 IDs por la limitación de Firestore en cláusulas `in`).
3. Borra el documento del curso.

Todo dentro de un único `writeBatch`.

### 13.6 Eliminar el horario completo

`DeleteScheduleDialog` exige una **confirmación en dos pasos** (dos clics separados en el tiempo) antes de ejecutar `deleteSchedule()`, que borra en un solo batch: `schedule/config`, `schedule/assignments`, **todos los cursos** y **todas las tareas vinculadas a cualquiera de esos cursos**. Tras esto, el usuario vuelve a ver el wizard de onboarding de Schedule (paso 1).

### 13.7 Exportación

`ExportMenu` permite exportar la grilla del horario (el nodo DOM referenciado por `gridRef`) como:

- **PNG**: captura con `html-to-image` (`toPng`, `pixelRatio: 3`), descarga directa.
- **PDF**: misma captura, insertada en un documento `jsPDF` en tamaño A4, con orientación automática (retrato/paisaje) según el aspect ratio de la imagen capturada.

Ambas librerías se importan dinámicamente (`import()`), y ambos procesos ocurren **enteramente en el cliente**, sin intervención de servidor.

## 14. Módulo: Calendario

### 14.1 Propósito

Vista mensual que agrega, **en el cliente**, cuatro fuentes de eventos completamente distintas — no existe una colección `events` en Firestore. Toda la agregación ocurre en `src/lib/calendar/build-events.ts`:

| Tipo (`kind`) | Fuente | Color | Notas |
|---|---|---|---|
| `tarea` | `Task.dueDate` (tareas personales) | Color del curso vinculado, o estilo neutro punteado si no tiene curso | |
| `teamclass` | `GroupTask.dueDate`, de cada grupo al que el usuario pertenece | Ámbar fijo | Rotulado con el nombre del proyecto |
| `countdown` | Widgets de tipo `countdown` del Dashboard (solo si tienen `title` y `targetDate`) | Pizarra fijo | Un único evento por widget |
| `cumpleanos` | Widgets de tipo `cumpleanos` del Dashboard | Rosa fijo | **Recurrente**: se genera una ocurrencia por cada año visible en la grilla de 6 semanas actual; el 29 de febrero se reubica al 28 en años no bisiestos |

### 14.2 Tiempo real

A diferencia de casi todos los demás módulos, Calendario suscribe con `onSnapshot` a tareas, cursos, membresías de grupo y widgets del dashboard, **más una suscripción dinámica por cada grupo activo** a sus tareas grupales (se crean/destruyen automáticamente según cambian las membresías). Es el único módulo cuya vista se actualiza sola sin recargar, ante cambios hechos en otra pestaña o por otro miembro de un grupo.

### 14.3 Grilla mensual

`getMonthGridDates()` (`src/lib/calendar/month-grid.ts`) siempre produce una grilla fija de **42 celdas (6 semanas)**, empezando en lunes, incluyendo días del mes anterior/siguiente (mostrados atenuados) para completar semanas. La navegación entre meses anima un desplazamiento horizontal según la dirección (`direction`), y un `YearPicker` (menú desplegable en portal, con auto-flip vertical) permite saltar directamente a un año entre ±7 del actual.

### 14.4 Panel de día

Al seleccionar un día se abre `DayPanel`: en escritorio (`≥1024px`, vía `useMediaQuery`) como panel lateral fijo de 380px; en móvil, como hoja deslizante desde el borde derecho con fondo semitransparente. Lista todos los eventos del día como `EventPill` en variante completa (ícono + título + etiqueta secundaria: nombre de curso o de proyecto). Cada celda del calendario muestra como máximo 3 píldoras compactas, con indicador "+N más" si hay más.

## 15. Módulo: Mis Tareas

### 15.1 Modelo

`Task` (`src/lib/tasks/types.ts`): `id`, `courseId` (opcional), `title`, `status` (`pendiente` | `en_progreso` | `finalizado`), `completed` (booleano), `completedAt`, `dueDate` (opcional), `createdAt`, `updatedAt`.

### 15.2 Interacción por fila

Cada fila (`TaskRow`) permite, sin recargar la página:

- Alternar completado (círculo → check animado).
- Editar el título in situ (confirma al perder el foco o presionar Enter).
- Reasignar el curso vinculado (`CoursePicker`, menú en portal).
- Cambiar el estado (`StatusPicker`: pendiente/en progreso/finalizado, cada uno con ícono y color propios).
- Cambiar/quitar la fecha de entrega (`DueDatePicker`, `<input type="date">`), con **codificación visual de urgencia**: vencida = rojo oscuro; hoy/mañana = rojo; 2–5 días = ámbar; 6+ días = esmeralda; sin fecha = punteado neutro.
- Eliminar la tarea.

### 15.3 Relación entre `completed` y `status`

El modelo tiene una particularidad no forzada por el código: marcar el estado como **"finalizado"** desde el `StatusPicker` también fuerza `completed = true` y `completedAt = ahora` (`setTaskStatus()`). Sin embargo, **mover el estado fuera de "finalizado" no revierte `completed`** — solo el checkbox de la fila puede des-completar una tarea. Es posible, dependiendo del orden de interacciones del usuario, llegar a una tarea con `completed: true` pero `status: "pendiente"` o `"en_progreso"` (ver sección 26).

### 15.4 Ordenamiento

`sortTasks()` (`src/lib/tasks/sort.ts`) primero **siempre separa** tareas activas de completadas (las completadas van al final, ordenadas por `completedAt` descendente sin importar el modo elegido). Sobre las activas aplica uno de 4 criterios (`SortControl`): `urgencia` (fecha de entrega más próxima primero, sin fecha al final), `curso` (alfabético por nombre de curso, sin curso al final), `estado` (pendiente < en progreso < finalizado) o `creacion` (por defecto, orden de creación).

### 15.5 Purga automática mensual

Cada vez que se monta `TareasView`, se ejecuta `purgeCompletedFromPreviousMonths()`: borra en un solo `writeBatch`, **sin confirmación ni posibilidad de deshacer**, cualquier tarea completada cuyo `completedAt` caiga en un mes calendario anterior al actual. Es un comportamiento automático silencioso que reduce el historial visible a "lo completado este mes o antes de completarse". El mismo patrón exacto existe para las tareas grupales de TeamClass (sección 16.5).

## 16. Módulo: TeamClass

### 16.1 Modelo de grupos

Los grupos **no cuelgan de un usuario**: viven en la raíz `groups/{code}`, donde `code` es un identificador numérico de **4 dígitos** generado aleatoriamente (`generateCode()`, `"0000"`–`"9999"`) que funciona a la vez como ID de documento y como "código de invitación" que se comparte manualmente entre compañeros.

`Group`: `code`, `projectName`, `leaderId`, `memberIds[]` (máx. 10, `MAX_GROUP_MEMBERS`), `createdAt`, `updatedAt`.

### 16.2 Crear grupo

`createGroup()` ejecuta una **transacción de Firestore** que reintenta hasta 20 veces generando un nuevo código si el generado ya existe (`CODE_TAKEN`), evitando colisiones incluso bajo creación concurrente. Dentro de la misma transacción se crean tres documentos: el grupo, `groups/{code}/members/{uid}` (snapshot de `name`/`photoURL` del creador en ese momento) y `users/{uid}/groupMemberships/{code}` (índice inverso para listar "mis grupos" sin una consulta de grupo de colecciones).

### 16.3 Unirse a un grupo

`joinGroup()`, también transaccional: valida que el grupo exista, que no esté lleno (10 miembros) y que el usuario no sea ya miembro (en cuyo caso es un no-op idempotente). El único dato requerido del usuario para unirse es el **código de 4 dígitos** — no hay aprobación del líder ni invitación explícita. Como `allow list: if false` en las reglas de Firestore impide enumerar todos los grupos existentes, el código actúa como el único control de acceso práctico (10 000 combinaciones posibles).

### 16.4 Salir / expulsar

- `leaveGroup()`: si el usuario que sale es el **último miembro**, se borra el grupo entero y todas sus tareas (limpieza completa, sin grupos huérfanos). Si quedan más miembros y el que sale era el líder, el liderazgo pasa a `remaining[0]` (el primer elemento restante del array `memberIds`, no necesariamente el miembro más antiguo por `joinedAt`).
- `expelMember()`: solo accesible desde la UI al líder (`MemberList`, botón visible únicamente si `leaderId === currentUid`); a nivel de reglas de Firestore, el patrón de expulsión exige que el líder se mantenga como líder y que el array de miembros disminuya en exactamente uno.

### 16.5 Tareas grupales

`GroupTask` es estructuralmente igual a `Task` pero **sin `courseId`** (no se vinculan a un curso del horario personal). Reutiliza literalmente los mismos componentes `StatusPicker` y `DueDatePicker` de Mis Tareas — es el caso más claro de reutilización de UI entre módulos de todo el código. Tienen la misma purga automática mensual que las tareas personales (`purgeFinishedFromPreviousMonths()`), disparada en cada actualización del listener `onSnapshot` de tareas del grupo (no solo al montar, a diferencia de Mis Tareas).

### 16.6 Vista de detalle del grupo

`GroupDetailView` (`src/app/(app)/teamclass/[code]/group-detail-view.tsx`) muestra:

- Nombre del proyecto y el código de 4 dígitos, con botón de copiar al portapapeles (animación de dos íconos que se intercambian, definida con `@keyframes` propios en `globals.css` — el único uso de CSS puro para animación en todo el proyecto, el resto usa Framer Motion).
- Progreso del grupo (`getGroupProgress()`: % de tareas en estado `finalizado`), como barra animada.
- Lista de integrantes (`MemberList`), con insignia de corona para el líder y botón de expulsión visible solo para el líder sobre el resto de miembros.
- Tabla de tareas grupales (añadir/editar/ordenar/eliminar) con `GroupSortControl` (mismos 3 criterios que Mis Tareas, sin la opción "curso" ya que las tareas grupales no tienen curso).
- Confirmación en dos pasos para "Salir del grupo".

## 17. Módulo: Dashboard

### 17.1 Dos sistemas de widgets independientes

**Fila de widgets fijos** (exactamente 3, no se pueden añadir ni quitar, solo reordenar entre sí):

| Widget | Contenido |
|---|---|
| `tareasPendientes` | Gráfico de dona (Recharts) con el conteo de tareas activas por estado (pendiente / en progreso) |
| `rendimientoMensual` | Gráfico de barras con tareas completadas por semana del mes actual (4 buckets) |
| `clasesHoy` | Lista de los bloques de clase de hoy, según Schedule; vacío en fin de semana (el horario solo cubre lunes–viernes) |

El orden se persiste en `users/{uid}/dashboard/config.fixedOrder` y se reordena arrastrando (`@dnd-kit`, estrategia horizontal).

**Grilla de widgets personalizables**: el usuario añade cualquier cantidad de widgets de 8 tipos posibles (`AddWidgetMenu`), cada uno como un documento independiente en `users/{uid}/dashboardWidgets`:

| Tipo (`WidgetType`) | Widget | Configuración de usuario | Notas |
|---|---|---|---|
| `hora` | Reloj (`ClockWidget`) | Formato 12h/24h | Dígitos estilo LED de 7 segmentos (`SevenSegmentDigit`, implementación propia) |
| `fecha` | `DateWidget` | Ninguna | Formatea con `Intl.DateTimeFormat("es-PE", ...)` |
| `countdown` | `CountdownWidget` | Título + fecha objetivo | Color/urgencia según días restantes; barra de progreso desde `createdAt` del widget hasta la fecha objetivo |
| `cumpleanos` | `BirthdayWidget` | Nombre + fecha de nacimiento | Calcula días hasta el próximo cumpleaños (cruzando de año si ya pasó este año) |
| `racha` | `StreakWidget` | Ninguna | `computeStreak()`: días consecutivos con al menos una tarea completada, anclado a hoy o ayer |
| `coleccionCursos` | `CourseCollectionWidget` | Ninguna | Nube animada con los nombres de todos los cursos de Schedule; ocupa 2 columnas (span fijo, no configurable) |
| `termometroMes` | `MonthThermometerWidget` | Ninguna | % transcurrido del mes actual |
| `resumenTareas` | `TaskSummaryWidget` | Ninguna | Tareas pendientes/completadas agrupadas por curso (incluye grupo "Sin curso") |

Cada widget guarda además un campo `variant` (entero aleatorio 0–4 asignado al crearlo) que impulsa variaciones puramente cosméticas sin necesidad de más estado — por ejemplo, `BirthdayWidget` usa `variant` para elegir uno de 5 pares de colores pastel/vívido.

### 17.2 Reordenamiento y eliminación

La grilla personalizable usa `@dnd-kit` con estrategia `rectSortingStrategy` (consciente de grilla, no solo lineal), y cada widget puede eliminarse pasando el cursor sobre él (botón "×" flotante). El campo `WIDGET_SPAN` (en `customizable-grid.tsx`) define anchos/altos de celda automáticos por tipo — el propio código documenta en un comentario que esto **reemplazó a un selector manual de tamaño que fue retirado deliberadamente** (ver sección 27).

### 17.3 Carga de datos y ausencia de tiempo real

`DashboardView` carga, en un único `Promise.all` al montar, tareas, cursos, configuración y asignaciones de horario, configuración del dashboard y widgets — sin `onSnapshot`. A diferencia de Calendario, **el Dashboard no se actualiza solo**: un cambio hecho en otra pestaña o módulo requiere recargar/revisitar la página para reflejarse aquí.

## 18. Módulo: Perfil

El módulo más simple de la aplicación (`src/app/(app)/perfil/page.tsx`), un **Server Component puro**: muestra avatar, nombre y correo (leídos directamente del perfil obtenido vía `firebase-admin`, sin edición posible desde la interfaz) y un botón de cierre de sesión (`SignOutButton`).

Contiene **dos bloques explícitamente no implementados** ("Próximamente estadísticas de actividad" y "Actividad reciente"), renderizados con el mismo componente `EmptyState` usado como placeholder de "aún no hay datos" en otros módulos — ver sección 27.

## 19. Flujo completo del usuario

```
1. Visita "/" 
   → sin cookie de sesión → /login
   → con cookie de sesión → /dashboard (sujeto a los gates del layout)

2. /login → "Continuar con Google" → popup de Google
   → POST /api/auth/session (crea perfil si no existe, fija cookie)
   → router.refresh()

3. Layout (app) evalúa:
   a) ¿Sesión válida? No → /login
   b) ¿onboardingCompleted? No → /onboarding
   c) ¿subscription.status === "active"? No → ReactivateView (paywall)
   d) Todo correcto → se renderiza el shell (Sidebar + contenido)

4. /onboarding (primera vez):
   Nombre → Edad → Pago (Stripe Checkout o bypass de desarrollo)
   → confirmación de pago → "Comenzar" → POST /api/onboarding/complete
   → /dashboard

5. Primer acceso a /schedule (si no existe schedule/config):
   Wizard de 5 pasos → horario creado → tablero de Schedule

6. Uso normal:
   Dashboard (resumen) ⇄ Schedule (horario) ⇄ Mis Tareas (tareas
   personales) ⇄ TeamClass (grupos y tareas colaborativas) ⇄
   Calendario (vista unificada de fechas) ⇄ Perfil (cuenta)

7. Suscripción vence o falla el cobro (vía webhook de Stripe):
   subscription.status pasa a "past_due"/"canceled" → en el siguiente
   acceso, el layout vuelve a mostrar ReactivateView hasta que se
   reactive el pago.
```

## 20. Relaciones entre módulos

| Origen | Destino | Naturaleza de la relación |
|---|---|---|
| Schedule (curso) | Mis Tareas | Una tarea puede vincularse a un curso (`Task.courseId`); **eliminar un curso o el horario completo borra en cascada las tareas vinculadas** |
| Schedule (curso, color) | Dashboard | El widget "Colección de cursos" y el widget fijo "Clases de hoy" leen cursos y la configuración/asignaciones de horario |
| Schedule (curso, color) | Calendario | Los eventos de tipo `tarea` heredan el color del curso vinculado |
| Mis Tareas | Dashboard | Los widgets fijos "Tareas pendientes" y "Rendimiento mensual", y los widgets `racha`/`resumenTareas`, se calculan a partir de las tareas personales |
| Mis Tareas | Calendario | Toda tarea con `dueDate` genera un evento `tarea` |
| TeamClass (tareas grupales) | Calendario | Toda tarea grupal con `dueDate`, de cualquier grupo del usuario, genera un evento `teamclass` |
| TeamClass (membresías) | Calendario | Determina a qué subcolecciones `groups/{code}/tasks` suscribirse en tiempo real |
| Dashboard (widgets `countdown`/`cumpleanos`) | Calendario | Generan eventos `countdown`/`cumpleanos` |
| Perfil (`name`, `photoURL`) | Sidebar, TeamClass | El nombre/foto del perfil se usa en la barra lateral y se **copia** (snapshot, no referencia viva) a `groups/{code}/members/{uid}` al crear/unirse a un grupo — si el usuario cambiara su nombre después (no hay UI para ello actualmente), los grupos existentes no se actualizarían solos |

No existen otras dependencias cruzadas: Schedule, Mis Tareas y TeamClass son, salvo lo anterior, módulos independientes entre sí.

## 21. Reglas de negocio

- Una suscripción activa es condición **obligatoria** para usar cualquier parte de la aplicación más allá del login/onboarding/perfil de lectura.
- El onboarding de cuenta no puede completarse sin que el servidor confirme `subscription.status === "active"`.
- El horario cubre únicamente **lunes a viernes** (`WEEKDAYS`, 5 días fijos) — no hay concepto de fin de semana en Schedule ni en "Clases de hoy" del Dashboard.
- Un grupo de TeamClass admite como máximo **10 integrantes** (`MAX_GROUP_MEMBERS`), reforzado tanto en el cliente como en las reglas de Firestore.
- Un grupo sin integrantes se autodestruye (junto con sus tareas) en el momento en que el último miembro sale.
- El líder de un grupo nunca puede quedarse "sin grupo" mientras sea líder de forma involuntaria: si abandona y quedan más miembros, el liderazgo se reasigna automáticamente.
- Las tareas completadas (personales y grupales) se purgan automáticamente al cambiar de mes calendario — no hay archivo histórico permanente de tareas completadas.
- Eliminar un curso o el horario completo elimina en cascada las tareas personales vinculadas a ese/esos curso(s); no hay una advertencia detallada de cuántos elementos se perderán antes de eliminar un curso individual (sí la hay, doble confirmación, para eliminar el horario completo).
- Los colores de curso, y los colores fijos de eventos no vinculados a curso (TeamClass/countdown/cumpleaños/neutro), están definidos para no colisionar visualmente entre sí.

## 22. Automatizaciones detectadas

| Automatización | Disparador | Efecto |
|---|---|---|
| `purgeCompletedFromPreviousMonths` | Montaje de `TareasView` | Borra tareas personales completadas de meses anteriores |
| `purgeFinishedFromPreviousMonths` | Cada actualización del listener de tareas grupales en `GroupDetailView` | Borra tareas grupales finalizadas de meses anteriores |
| `SubscriptionSync` | Presencia de `?session_id=` en la URL dentro del shell autenticado | Confirma el pago contra Stripe y refresca la página, sin interacción del usuario |
| `AuthProvider` (`onAuthStateChanged`) | Cambios de estado de Firebase Auth en el navegador | Mantiene sincronizado `useAuth().user` en todo el árbol cliente |
| Reasignación de líder en `leaveGroup` | El líder abandona un grupo con más integrantes | Promueve automáticamente a otro miembro |
| Generación/reintento de código de grupo | Colisión de código de 4 dígitos al crear un grupo | Reintenta hasta 20 veces con un nuevo código aleatorio |
| Bypass de pago en desarrollo | Variables de entorno de Stripe ausentes | Activa la suscripción sin cobro real (ver sección 26) |

## 23. Responsive design

El uso de utilidades responsivas de Tailwind (`sm:`, `lg:`) es puntual, no sistemático: aparece principalmente en la grilla de widgets del Dashboard y en las tarjetas de grupos de TeamClass (cambian de número de columnas). El único punto de quiebre **comportamental** real (no solo de layout) es `useMediaQuery("(min-width: 1024px)")` en el `DayPanel` del Calendario, que decide entre panel lateral fijo y hoja deslizante.

**La barra lateral (`Sidebar`) no tiene ningún comportamiento responsivo**: es una columna fija de 240px (`w-60`) sin colapso, sin menú hamburguesa ni navegación alternativa para pantallas angostas. En la práctica, el shell autenticado de NovaClass está diseñado para escritorio; su usabilidad en viewports móviles es limitada pese al uso puntual de clases `sm:`/`lg:` dentro de páginas individuales.

## 24. Accesibilidad

Presente:

- `aria-label` en numerosos botones de solo ícono (navegación, eliminar, cerrar, copiar, expulsar, seleccionar año/mes).
- `aria-hidden="true"` consistente en todas las capas puramente decorativas (fondos, blobs, SVGs ambientales).
- Manejo de "clic fuera" (`useClickOutside`) para cerrar menús y modales.
- Uso de `@radix-ui/react-slider` (primitivo accesible) para los sliders de edad/bloques.

Ausente o no verificado en el código:

- No hay estilos de foco visibles personalizados más allá del comportamiento por defecto del navegador.
- Las interacciones de arrastrar y soltar (`@dnd-kit`) solo configuran `PointerSensor`; **no hay sensor de teclado configurado**, por lo que reordenar widgets, asignar cursos al horario, etc., no es accesible por teclado.
- No hay regiones `aria-live` para anunciar cambios asíncronos (tarea añadida, widget eliminado, grupo creado).
- No hay "skip links" ni landmarks explícitos adicionales a los elementos semánticos usados (`main`, `aside`, `nav`).
- No existe ninguna suite de pruebas de accesibilidad (axe, Testing Library, etc.) en el repositorio.

## 25. Configuración relevante

### 25.1 Variables de entorno (`.env.local.example`)

| Variable | Propósito |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Config del SDK cliente de Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ídem |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ídem |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ídem (Storage está inicializado en `src/lib/firebase/client.ts` pero **no se encontró ningún uso real de Firebase Storage en el resto del código** — ver sección 27) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ídem |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ídem |
| `FIREBASE_ADMIN_PROJECT_ID` | Credenciales de servicio para `firebase-admin` |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | ídem |
| `FIREBASE_ADMIN_PRIVATE_KEY` | ídem (se normalizan los `\n` literales al cargarla) |
| `STRIPE_SECRET_KEY` | SDK de Stripe en servidor |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Declarada, pero sin uso detectado en el código (no hay `loadStripe`/Stripe Elements) |
| `STRIPE_WEBHOOK_SECRET` | Verificación de firma del webhook |
| `STRIPE_PRICE_ID` | Precio único de la suscripción |
| `NEXT_PUBLIC_APP_URL` | Base para las URLs de retorno de Stripe Checkout |

### 25.2 Otros archivos de configuración

- `next.config.ts`: configuración por defecto, sin opciones personalizadas (sin dominios de imágenes remotas, sin redirects/headers configurados).
- `firebase.json` / `.firebaserc`: solo declaran la ruta de las reglas de Firestore (`firestore.rules`) y el proyecto por defecto (`novaclass-app-2026`); no hay configuración de Hosting, Functions ni Storage Rules.
- `tsconfig.json`: `strict: true`, alias `@/*` → `src/*`.
- `eslint.config.mjs`: flat config basado en `eslint-config-next` (`core-web-vitals` + `typescript`).
- `postcss.config.mjs`: únicamente el plugin `@tailwindcss/postcss` (Tailwind 4).

## 26. Seguridad implementada

- **Separación cliente/servidor de secretos**: todo módulo que usa `firebase-admin` o el SDK de servidor de Stripe está marcado con `import "server-only"`, lo que provoca un error de compilación si alguno de esos módulos terminara importado en código destinado al navegador — evita que las credenciales de servicio o la clave secreta de Stripe se filtren al bundle cliente.
- **Perfil de usuario de solo lectura desde el cliente**: como se detalla en la sección 12.3, el documento raíz `users/{uid}` no puede escribirse directamente desde Firestore-cliente; el estado de suscripción solo puede cambiarlo código de servidor confiable.
- **Verificación de titularidad en la confirmación de pago**: tanto `/api/stripe/confirm` como el flujo de reactivación comprueban que `checkoutSession.metadata.uid` coincida con el usuario autenticado antes de aplicar cualquier cambio de suscripción, evitando que un usuario reutilice o intercepte el `session_id` de otro.
- **Verificación de firma del webhook de Stripe** (`stripe.webhooks.constructEvent`) antes de procesar cualquier evento entrante.
- **Cookie de sesión** `httpOnly`, `secure` en producción, `sameSite: "lax"`, con verificación de revocación (`checkRevoked: true`) en cada lectura server-side.
- **Reglas de Firestore como autorización primaria** para todo el resto de datos (tareas, horario, cursos, widgets, grupos) — ver desglose completo en la sección 12.3, incluyendo el mecanismo anti-enumeración de grupos (`list: false`) y las tres transiciones de estado permitidas para `groups/{code}.memberIds`.
- **Riesgo identificado — bypass de pago en desarrollo**: si `STRIPE_PRICE_ID`, `STRIPE_SECRET_KEY` o `NEXT_PUBLIC_APP_URL` no están configuradas, `/api/stripe/checkout` activa la suscripción sin cobrar (sección 10.2, paso 2). El propio código lo documenta como un atajo de desarrollo, pero **si el proyecto se desplegara a producción sin fijar correctamente esas tres variables, cualquier usuario obtendría acceso completo sin pagar**. No hay ninguna otra comprobación (por ejemplo, de entorno `NODE_ENV`) que restrinja este bypass exclusivamente a desarrollo.

## 27. Código muerto, funcionalidades incompletas y elementos experimentales

| Ubicación | Descripción | Propósito aparente | Estado | Impacto |
|---|---|---|---|---|
| `src/app/(app)/perfil/page.tsx` | Dos bloques `EmptyState`: "Próximamente estadísticas de actividad" y "Actividad reciente" | Futuras métricas de uso (racha, cursos, última tarea) | Sin implementar — no existe ninguna lógica, hook ni componente de soporte en el resto del repositorio | Bajo (aislado a la página de Perfil, no bloquea nada) |
| `src/app/(app)/dashboard/customizable-grid.tsx` (`WIDGET_SPAN`) | Comentario explícito: "reemplazó al antiguo selector manual de tamaño, que permanece retirado" | Anteriormente el usuario podía elegir el tamaño de cada widget | Funcionalidad retirada deliberadamente; hoy el tamaño es automático y fijo por tipo | Ninguno funcional; documenta una decisión de producto ya tomada |
| `src/app/api/stripe/checkout/route.ts` | Bypass de activación de suscripción sin pago cuando faltan credenciales de Stripe | Permitir desarrollo local sin cuenta de Stripe configurada | Implementado y funcional, pero sin salvaguarda de entorno | Alto si se despliega a producción sin las variables de Stripe (ver sección 26) |
| `src/lib/tasks/data.ts` (`setTaskStatus`) / `task-row.tsx` | `completed` puede quedar `true` con `status` distinto de `"finalizado"`, o viceversa según el orden de acciones del usuario | — | Comportamiento no forzado por el modelo de datos ni por la interfaz | Bajo/medio: posible inconsistencia visual (tarea tachada pero con estado "Pendiente", por ejemplo) |
| `src/lib/schedule/data.ts` (`createSchedule`) | Dos `setDoc` secuenciales (config, luego assignments) en vez de una escritura atómica | — | Funcional en el camino feliz | Bajo: un fallo de red entre ambas escrituras dejaría `schedule/config` sin `schedule/assignments`; `ScheduleView` trataría igualmente la existencia de `config` como "onboarding completo" |
| `src/lib/firebase/client.ts` (`export const storage`) | Firebase Storage se inicializa en el cliente | Presumiblemente para subir archivos/imágenes en el futuro | **No se encontró ningún uso de `storage` en el resto del código fuente** (ni subida de archivos, ni reglas de Storage en `firebase.json`) | Ninguno funcional; inicialización sin consumidores |
| `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Plantillas por defecto de `create-next-app` | Iconografía de ejemplo del boilerplate | Sin ninguna referencia en `src/` | Ninguno; peso muerto en `public/` |
| Constante `EASE` (`[0.22, 1, 0.36, 1]`) | Redefinida localmente en más de una decena de archivos de componentes | Curva de animación estándar de la app | Funciona correctamente, pero está duplicada en vez de centralizada (solo el módulo Calendario la exporta desde un módulo compartido, `lib/calendar/motion.ts`) | Ninguno funcional; mantenibilidad |
| `@stripe/stripe-js` (dependencia) | Declarada en `package.json` | Integración de Stripe Elements/Checkout embebido en el cliente | Sin ningún uso detectado (`loadStripe` no aparece en el código); el flujo actual de pago redirige por URL a Stripe Checkout Hosted | Ninguno funcional; dependencia sin consumidor |

## 28. Limitaciones actuales

- **Sin pruebas automatizadas**: no hay ningún framework de testing instalado ni archivos de prueba.
- **Dashboard sin tiempo real**: cambios hechos en Schedule, Mis Tareas o TeamClass no se reflejan en los widgets del Dashboard hasta recargar/revisitar la página.
- **Shell no responsivo para móvil**: la barra lateral fija de 240px no colapsa; la aplicación autenticada está diseñada para escritorio.
- **Sin edición de perfil**: no existe ninguna pantalla para cambiar nombre, foto o edad después del onboarding; los snapshots de nombre/foto guardados en `groups/{code}/members/{uid}` quedarían desactualizados si el usuario cambiara su nombre en Google.
- **Historial de tareas no persistente**: la purga automática mensual (secciones 15.5 y 22) borra permanentemente las tareas completadas de meses anteriores; no hay forma de consultar un historial completo.
- **Sin notificaciones ni recordatorios**: pese a que las tareas y eventos tienen fecha de entrega, no existe ningún sistema de notificaciones, correo o recordatorios.
- **Un único plan de suscripción**: no hay lógica de niveles, descuentos, períodos de prueba ni facturación anual.
- **Accesibilidad de teclado limitada** en interacciones de arrastrar y soltar (sección 24).
- **Código de grupo de solo 4 dígitos** (10 000 combinaciones): mitigado por la imposibilidad de enumerar grupos (`list: false`), pero sigue siendo un espacio de códigos pequeño frente a, por ejemplo, ataques de fuerza bruta dirigidos si se conociera parcialmente un código.

## 29. Posibles mejoras detectadas

A partir de los patrones observados en el propio código (no son requerimientos del usuario, sino observaciones técnicas derivadas de la auditoría):

- Centralizar la constante `EASE` de Framer Motion en un único módulo compartido (como ya se hace en `lib/calendar/motion.ts`) para reducir duplicación entre módulos.
- Forzar consistencia entre `Task.completed` y `Task.status` (por ejemplo, derivando uno del otro en un único punto de escritura) para eliminar el estado intermedio inconsistente descrito en la sección 27.
- Restringir explícitamente el bypass de pago de `/api/stripe/checkout` a entornos de desarrollo (por ejemplo, comprobando `NODE_ENV !== "production"` además de la ausencia de variables), para reducir el riesgo de que un despliegue mal configurado otorgue acceso gratuito.
- Unificar `createSchedule()` en una escritura atómica (batch o transacción) para eliminar la ventana de inconsistencia entre `schedule/config` y `schedule/assignments`.
- Añadir sincronización en tiempo real (`onSnapshot`) al Dashboard, replicando el patrón ya usado en Calendario, para que los widgets reflejen cambios sin recargar.
- Retirar las dependencias y archivos sin consumidores detectados (`@stripe/stripe-js`, los SVG de plantilla en `public/`, la inicialización de `storage` si no se planea usar Firebase Storage) para reducir superficie de mantenimiento.
- Incorporar un sensor de teclado en las integraciones de `@dnd-kit` (horario, reordenamiento de widgets) para cumplir con criterios básicos de accesibilidad de teclado.

---

*Fin del documento. Generado exclusivamente a partir del código fuente presente en el repositorio al momento de la auditoría.*
