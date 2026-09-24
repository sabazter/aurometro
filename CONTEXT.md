# 📋 CONTEXT.md — Aurómetro

## 📌 Descripción del Proyecto
App web de gamificación social ("Aura Points") para estudiantes de secundaria/bachillerato en Venezuela.
Los alumnos se registran voluntariamente, organizados por año y sección, y pueden dar o quitar "puntos de aura" a otros compañeros.

- **NO es obligatorio** registrarse.
- **NO involucra dinero** ni recompensas tangibles.
- Es una herramienta de humor/cultura estudiantil supervisada por el profesor.

---

## 🔐 Consideraciones Legales (LOPNNA - Venezuela)
- Usuarios son **menores de edad** → se aplica LOPNNA (Arts. 65-68).
- Se implementan **todas las protecciones anti-acoso** recomendadas.
- Datos mínimos: nombre, apellido, apodo (opcional), correo (solo auth).
- Correos **nunca visibles** para otros usuarios.
- Disclaimer obligatorio al registro.
- Derecho al olvido: borrar cuenta = borrar todos los datos.

---

## 🛠️ Stack Tecnológico
| Capa          | Tecnología                          |
|---------------|-------------------------------------|
| Frontend      | React 18+ + Vite + Tailwind CSS 3   |
| Backend       | Node.js + Express.js                |
| ORM           | Prisma                              |
| Base de Datos | PostgreSQL (Docker en desarrollo)   |
| Auth          | JWT (correo + contraseña)           |

---

## 🏗️ Arquitectura y Fases

### Fase 1: Core MVP ← **ACTUAL**

#### 1.1 Backend — Modelos y Auth
- [ ] Scaffolding: proyecto Node.js + Express + Prisma
- [ ] Docker Compose con PostgreSQL
- [ ] Schema Prisma: User, UserPreferences, AuraTransaction
- [ ] Auth: Registro con correo + contraseña + bcrypt
- [ ] **Verificación de correo**: envío de email con token de verificación
- [ ] Auth: Login → JWT (access token)
- [ ] Middleware de auth + roles (STUDENT / ADMIN)
- [ ] Disclaimer obligatorio aceptado al registrarse (campo `disclaimerAcceptedAt`)

#### 1.2 Backend — Lógica de Negocio
- [ ] Endpoint: listar usuarios por año y sección (alfabéticamente)
- [ ] Endpoint: dar/quitar punto de aura (con todas las validaciones)
  - No a ti mismo
  - Cooldown 24h por par y tipo
  - Presupuesto semanal (5+5, stakeable L-V)
  - Respetar modo de participación del receptor
- [ ] Endpoint: ranking con filtros (año, sección, ordenamiento)
- [ ] Endpoint: presupuesto actual del usuario
- [ ] Endpoint: preferencias del usuario (GET/PUT)
- [ ] Panel admin: congelar, resetear aura, eliminar cuentas, ver transacciones con nombres

#### 1.3 Frontend — Pantallas

**🔐 Pantalla 1: Login / Register**
- Formulario de login (correo + contraseña)
- Formulario de registro (nombre, apellido, apodo, correo, contraseña, año, sección, foto)
- Disclaimer con checkbox obligatorio
- Pantalla de "verifica tu correo"

**🧭 Pantalla 2: Onboarding (post-verificación, primer login)**
- Wizard de 2-3 pasos explicando:
  - Qué son los modos (Espectador/Controlado/Completo)
  - Qué es el toggle de score
  - Qué es el toggle de ranking
- El usuario elige sus preferencias iniciales

**🏠 Pantalla 3: Home (Dashboard)**
- 3 bloques/cards principales:
  1. **⚡ Dar / Quitar Puntos** → navega a la pantalla de selección
  2. **🏆 Ranking** → navega al ranking
  3. **⚙️ Configuración** → navega a settings
- Resumen rápido: tu aura actual (si lo tienes visible), puntos disponibles hoy

**⚡ Pantalla 4: Dar / Quitar Puntos**
- Navegación jerárquica: **CSAM → Año (1ro-5to) → Sección (A,B,C,D)**
- Al seleccionar sección: lista de alumnos con **foto, nombre, apellido, apodo**
- Ordenados alfabéticamente por apellido
- Al tocar un alumno: modal/drawer para dar +1 o -1 punto (con razón opcional)
- Muestra puntos disponibles del usuario (positivos/negativos restantes)

**🏆 Pantalla 5: Ranking**
- Vista por defecto: ranking del año seleccionado
- Filtros:
  - Por año (1ro-5to o "todos")
  - Por sección (A,B,C,D o "todas")
  - Ordenamiento: mayor a menor / menor a mayor
- Cada entrada muestra: posición, foto, nombre, apodo, puntaje (solo si el usuario lo tiene visible)
- Solo aparecen usuarios que eligieron ser visibles en ranking

**⚙️ Pantalla 6: Configuración**
- Tema: modo claro / oscuro
- Modo de participación: Espectador / Controlado / Completo
- Toggle: mostrar/ocultar score
- Toggle: aparecer/no en ranking
- Cambiar foto de perfil
- Cambiar apodo
- Eliminar cuenta (con confirmación)

#### 1.4 Rutas Frontend
| Ruta                          | Pantalla                        |
|-------------------------------|---------------------------------|
| `/login`                      | Login                           |
| `/register`                   | Registro + disclaimer           |
| `/verify-email/:token`        | Verificación de correo          |
| `/onboarding`                 | Wizard de preferencias          |
| `/`                           | Home (dashboard)                |
| `/points`                     | CSAM: selección de año          |
| `/points/:year`               | Selección de sección            |
| `/points/:year/:section`      | Lista de alumnos                |
| `/ranking`                    | Ranking con filtros             |
| `/settings`                   | Configuración del usuario       |

#### 1.5 Rutas Backend (API)
| Método | Ruta                              | Descripción                          |
|--------|-----------------------------------|--------------------------------------|
| POST   | `/api/auth/register`              | Registro + envío email verificación  |
| POST   | `/api/auth/login`                 | Login → JWT                          |
| GET    | `/api/auth/verify-email/:token`   | Verificar correo                     |
| GET    | `/api/users/me`                   | Perfil propio                        |
| PUT    | `/api/users/me/preferences`       | Actualizar preferencias              |
| PUT    | `/api/users/me/profile`           | Actualizar perfil (foto, apodo)      |
| DELETE | `/api/users/me`                   | Eliminar cuenta (derecho al olvido)  |
| GET    | `/api/users/year/:year/section/:section` | Listar alumnos de una sección |
| POST   | `/api/aura/give`                  | Dar o quitar punto de aura           |
| GET    | `/api/aura/budget`                | Presupuesto actual del usuario       |
| GET    | `/api/ranking`                    | Ranking con query params de filtro   |
| GET    | `/api/admin/transactions`         | (ADMIN) Ver todas las transacciones  |
| PUT    | `/api/admin/users/:id/freeze`     | (ADMIN) Congelar/descongelar cuenta  |
| PUT    | `/api/admin/users/:id/reset-aura` | (ADMIN) Resetear aura de un usuario  |
| DELETE | `/api/admin/users/:id`            | (ADMIN) Eliminar usuario             |

### Fase 2: Reportes y Métricas
- [ ] Historial personal de aura (cuándo te dieron, sin revelar quién)
- [ ] Gráficas de evolución de aura
- [ ] Top semanal / mensual por sección

### Fase 3: Funciones Interactivas
- [ ] Perfil público personalizable
- [ ] Badges / logros por hitos de aura
- [ ] Feed de actividad (anónimo)

### Fase 4: Optimización y Seguridad
- [ ] Rate limiting avanzado
- [ ] Backups automáticos
- [ ] Auditoría de acciones admin

---

## 🎮 Modos de Participación (Onboarding)

Después del registro, el alumno pasa por un wizard de preferencias que le explica cada opción:

### 👁️ Espectador
- Puede ver el ranking y perfiles públicos.
- **NO puede** dar ni recibir puntos.
- **NO aparece** en el ranking.
- Su score no existe (no participa activamente).

### 🎯 Controlado
- **Puede dar** puntos a otros.
- **Puede recibir** puntos de otros.
- Su score está **oculto por defecto** (puede activar el toggle).
- **NO aparece** en el ranking por defecto (puede activarlo).

### 🚀 Completo
- **Puede dar y recibir** puntos.
- Score **visible** por defecto.
- **Aparece en el ranking** por defecto.
- Experiencia completa sin restricciones autoimpuestas.

> **Nota**: El usuario puede cambiar su modo y preferencias en cualquier momento desde su perfil.

---

## 📊 Sistema de Puntos — Reglas Detalladas

### Presupuesto Semanal
- **10 puntos por semana**: 5 positivos (+aura) y 5 negativos (-aura).
- **Distribución diaria**: Máximo 2 puntos por día (1 positivo + 1 negativo).
- **Stakeable**: Si no usaste tus puntos un día de semana, se acumulan para los días siguientes de esa misma semana.
- **Solo L-V**: Los fines de semana NO generan puntos nuevos. Pero puedes usar puntos acumulados durante el finde si la app está activa.
- **Reset semanal**: Cada lunes a las 00:00, el presupuesto se resetea a 5+5.

### Ejemplo de Acumulación
| Día    | Disponible (+) | Disponible (-) | Usados | Notas                    |
|--------|:--------------:|:--------------:|:------:|--------------------------|
| Lunes  | 1              | 1              | 0      | No usó ninguno           |
| Martes | 2              | 2              | 1(+)   | Usó 1 positivo           |
| Miércoles | 2           | 3              | 0      | Acumuló el de martes     |
| Jueves | 3              | 4              | 2(-)   | Usó 2 negativos          |
| Viernes| 4              | 3              | 0      | Último día de acumulación|
| Sábado | 4              | 3              | -      | No se generan nuevos     |
| Domingo| 4              | 3              | -      | No se generan nuevos     |
| Lunes  | 1              | 1              | -      | RESET: 5+5 nueva semana  |

### Cooldown
- Puedes dar **1 punto positivo** y **1 punto negativo** a un **mismo usuario** cada 24 horas.
- Es decir: puedes darle +100 aura Y -100 aura al mismo usuario el mismo día.
- Pero no puedes darle +200 al mismo usuario el mismo día.

### Valor
- 1 punto = 100 aura en el score.
- Score sin piso: puede ser -∞.

---

## 📐 Modelo de Datos (Propuesta Fase 1)

### User
| Campo                | Tipo      | Notas                              |
|----------------------|-----------|------------------------------------|
| id                   | UUID      | PK                                 |
| email                | String    | Único, solo para auth              |
| password             | String    | Hasheado con bcrypt                |
| firstName            | String    | Nombre                             |
| lastName             | String    | Apellido                           |
| nickname             | String?   | Apodo, opcional                    |
| avatarUrl            | String?   | URL de foto de perfil              |
| year                 | Int       | Año escolar (1-5)                  |
| section              | String    | Sección (A, B, C, D)              |
| role                 | Enum      | STUDENT / ADMIN                    |
| isFrozen             | Boolean   | Cuenta congelada por admin         |
| emailVerified        | Boolean   | Si verificó su correo              |
| verificationToken    | String?   | Token para verificar email         |
| disclaimerAcceptedAt | DateTime? | Cuándo aceptó el disclaimer        |
| onboardingCompleted  | Boolean   | Si completó el wizard inicial      |
| createdAt            | DateTime  |                                    |
| updatedAt            | DateTime  |                                    |

### UserPreferences
| Campo             | Tipo     | Notas                                    |
|-------------------|----------|------------------------------------------|
| id                | UUID     | PK                                       |
| userId            | UUID     | FK → User (1:1)                          |
| participationMode | Enum     | SPECTATOR / CONTROLLED / FULL            |
| showScore         | Boolean  | Toggle: mostrar/ocultar score propio     |
| showInRanking     | Boolean  | Toggle: aparecer/no en ranking público   |
| theme             | Enum     | LIGHT / DARK                             |
| updatedAt         | DateTime |                                          |

### AuraTransaction (Ledger inmutable, append-only)
| Campo        | Tipo     | Notas                              |
|--------------|----------|------------------------------------|
| id           | UUID     | PK                                 |
| fromUserId   | UUID     | FK → User (quien da/quita)         |
| toUserId     | UUID     | FK → User (quien recibe)           |
| points       | Int      | +1 o -1 (1 punto = 100 aura)      |
| type         | Enum     | POSITIVE / NEGATIVE                |
| reason       | String?  | Motivo opcional (max 140 chars)     |
| createdAt    | DateTime | Timestamp de la transacción         |

### WeeklyBudget (calculado o cacheado)
| Campo             | Tipo     | Notas                                  |
|-------------------|----------|----------------------------------------|
| id                | UUID     | PK                                     |
| userId            | UUID     | FK → User                             |
| weekStart         | DateTime | Lunes de la semana                     |
| positiveUsed      | Int      | Puntos positivos usados (0-5)          |
| negativeUsed      | Int      | Puntos negativos usados (0-5)          |
| positiveAvailable | Int      | Disponibles hoy (acumulados)           |
| negativeAvailable | Int      | Disponibles hoy (acumulados)           |

---

## 📝 Decisiones de Arquitectura
1. **Ledger inmutable**: Las transacciones nunca se borran/editan; el score se calcula con `SUM(points * 100)`.
2. **Anonimato asimétrico**: Los estudiantes NO ven quién les dio puntos. El admin (profesor) SÍ lo ve.
3. **Score con toggle**: Cada usuario controla si su score es público o privado.
4. **Ranking opt-in**: Cada usuario elige si aparece en el ranking.
5. **Modos de participación**: Tres niveles (Espectador/Controlado/Completo) configurables en cualquier momento.
6. **Presupuesto stakeable L-V**: Los puntos no usados se acumulan durante la semana, reset los lunes.
7. **Admin omnisciente**: El profesor ve todas las transacciones con nombres, puede moderar.
8. **Sin piso de aura**: El score puede ser infinitamente negativo (decisión del profesor).
9. **Verificación de correo**: Obligatoria antes de poder usar la app. Servicio: **Gmail** (Nodemailer + App Password).
10. **Fotos de perfil**: Los usuarios pueden subir una foto (almacenada como URL).
11. **Aura base = 0**: Todos los usuarios comienzan con 0 aura. El score se calcula con `SUM(points * 100)` desde el ledger.

---

## 📅 Sesión 1 — 2026-09-24 (mañana)
- **Estado**: Planificación y asesoría legal.
- **Acciones**: Análisis legal LOPNNA, definición de protecciones, propuesta de arquitectura.

## 📅 Sesión 2 — 2026-09-24 (tarde)
- **Estado**: Refinamiento de reglas de negocio.
- **Acciones**:
  - Reformulación del sistema de puntos: 5+5 semanal, 2/día, stakeable L-V.
  - Definición de 3 modos de participación (Espectador/Controlado/Completo).
  - Score con toggle, ranking opt-in.
  - Anonimato asimétrico (estudiantes no ven, admin sí).
  - Sin piso de aura.
  - Onboarding post-registro con wizard de preferencias.
  - Tabla UserPreferences y WeeklyBudget añadidas al modelo.

## 📅 Sesión 3 — 2026-09-24 (tarde, continuación)
- **Estado**: Definición de MVP — pantallas y rutas.
- **Acciones**:
  - Definición de 6 pantallas del MVP (Login, Onboarding, Home, Puntos, Ranking, Config).
  - Flujo de navegación CSAM → Año → Sección → Alumnos.
  - Verificación de correo obligatoria.
  - Foto de perfil (avatarUrl) añadida al modelo User.
  - disclaimerAcceptedAt, emailVerified, verificationToken, onboardingCompleted añadidos.
  - Tema claro/oscuro añadido a UserPreferences.
  - Rutas frontend y backend definidas.
- **Próximos pasos**: Aprobación → Scaffolding del proyecto (backend + frontend + Docker).

## 📅 Sesión 5 — 2026-09-24 (ajustes de UI/UX, navegación y reglas de negocio)
- **Estado**: ✅ Cambios aplicados y servidores corriendo.
- **Acciones**:
  1. **Modo Claro / Oscuro**: Se rediseñaron todos los componentes base (`Card`, `Input`, `Modal`, `Toggle`, `Layout`, `Home`, `Ranking`, `PointsStudents`, `Register`, `Login`) para tener estilos claros y oscuros elegantes usando Tailwind (`dark:...`).
  2. **Navegación Volver Atrás**:
     - Agregado botón universal "← Volver" en la barra superior (`Layout.tsx`).
     - Agregados enlaces de retorno claros en cada subpantalla (`/points`, `/points/:year`, `/points/:year/:section`).
     - Agregada barra de navegación de escritorio en el encabezado.
  3. **Independencia Institucional**: Se eliminó cualquier mención de "CSAM" o colegios. Los textos son neutros y enfocados exclusivamente en la app "Aurómetro".
  4. **Invisibilidad de Administradores**:
     - Se filtró el rol `ADMIN` en la consulta de listas de alumnos por sección (`user.routes.ts`).
     - Se filtró el rol `ADMIN` en la consulta del ranking público (`ranking.service.ts`).
     - Se bloqueó en `aura.service.ts` la posibilidad de enviar o recibir puntos a usuarios `ADMIN`.
  5. **Optimización Mobile-First**:
     - Configurados meta-tags de PWA / Web App (viewport anti-zoom, theme-color `#0a0a0a`, status bar de pantalla completa).
     - Botones con tamaño táctil mínimo de 44px, feedback háptico/de presión (`active:scale-95`), `touch-manipulation` y eliminación de retardo de toque (300ms delay).
     - Modales adaptados como **Bottom Sheets** táctiles deslizables desde abajo en pantallas móviles con indicador de agarre (grab handle).
     - Barra de navegación fija inferior adaptada ergonómicamente a pulgares en móviles.
- **Próximos pasos**:
  1. Refrescar la app en `http://localhost:5174/`.
  2. Probar cambio entre modo claro ☀️ y oscuro 🌙 desde la barra superior.
  3. Probar los botones de retorno "← Volver".
  4. Comprobar que los administradores no aparecen en las listas ni en el ranking.
