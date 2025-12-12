# Marriott Hoteles – Proyecto Tecnologías Web

Proyecto grupal del ramo **Tecnologías Web** de Ingeniería Civil en Computación e Informática.  
<<<<<<< HEAD
El sistema implementa una **plataforma SPA en Angular** para la gestión de estancias y reservas en la cadena Marriott, con **vistas diferenciadas por rol** (Cliente y Administrador).
=======
El sistema implementa una **plataforma SPA en Angular** para la gestión de estancias y reservas en la cadena de hoteles Marriott, con **vistas diferenciadas por rol** (Cliente y Administrador).
>>>>>>> origin/mi-avance

---

## Equipo de trabajo

<<<<<<< HEAD
| Rol | Responsabilidades Principales | Integrante Asignado |
|-----|-------------------------------|----------------------|
| **Scrum Master / Líder de Proyecto** | Coordina tareas, merges, revisa buenas prácticas (nombres, estructura, comentarios) y programa módulos clave (routing general, guards, auth). | **Álvaro Lovera** |
| **Desarrollador de Interfaces (UI/UX + Frontend)** | Diseña la estructura visual con Bootstrap, Navbar, Footer, Home y vistas cliente. Aporta commits HTML/CSS y componentes Angular. | **Claudio Carvajal**, **Martín Castillo** |
| **Desarrollador Funcional (Frontend + Lógica de Negocio)** | Implementa lógica de formularios, validaciones y comunicación entre componentes. | **Fernando Garrido**, **Claudio Carvajal** |
| **Desarrollador de Servicios y Testing** | Implementa `Services`, `Injection`, `Observables`, `Guards`, y realiza pruebas unitarias (`ng test`). | **Álvaro Lovera**, **Martín Castillo** |

---

## Configuración del proyecto

- **Framework:** Angular 15.2.0  
- **TypeScript:** 4.9.4
- **Librerías:** Bootstrap 5.3.8, jQuery 3.7.1, Popper.js 1.16.1  
- **Backend Mock:** json-server (puerto 3000)
- **RxJS:** 7.8.0
- **Estilos globales:** `src/styles.scss`  

### Estructura modular

- `pages/client` → vistas del cliente (home, login, register, profile, catalog, cart)
- `pages/admin` → vistas del administrador (dashboard, hotels, events, users)
- `components` → elementos compartidos (navbar, footer, etc.)  
- `core/services` → servicios de inyección de dependencias (AuthService, HotelService, AdminUserService, EventService)
- `core/guards` → protección de rutas (AuthGuard, RoleGuard)
- `core/models` → interfaces y tipos de datos
- `shared` → recursos comunes (not-found page)

### Rutas base

#### Rutas Públicas (Cliente)
- `/client/home` → página principal
- `/client/login` → autenticación de usuario
- `/client/register` → registro de nuevo usuario
- `/client/catalog` → catálogo de hoteles (sin protección)

#### Rutas Protegidas (Cliente)
- `/client/profile` → perfil del usuario logueado (requiere AUTH + rol CLIENT)
- `/client/cart` → carrito de compras (requiere AUTH + rol CLIENT)

#### Rutas Protegidas (Administrador)
- `/admin/dashboard` → resumen general (requiere AUTH + rol ADMIN)
- `/admin/hotels` → CRUD de hoteles (requiere AUTH + rol ADMIN)
- `/admin/events` → CRUD de eventos (requiere AUTH + rol ADMIN)
- `/admin/users` → gestión de usuarios (requiere AUTH + rol ADMIN)

### Navegación y Protección de Rutas

- **Layouts independientes:**  
  - `ClientComponent` → contenedor para rutas cliente (con navbar y footer)
  - `AdminComponent` → contenedor para rutas admin (con navbar y footer)

- **Guards implementados:**  
  - `AuthGuard` → verifica si el usuario está autenticado
  - `RoleGuard` → verifica si el usuario tiene el rol requerido para la ruta
  
- **Redirección inicial:** `/` → `/client/home`  
- **Rutas no encontradas:** `**` → `/404` (NotFoundComponent)

### Versionado y Estándar de Commits

- `feat:` nueva funcionalidad  
- `fix:` corrección de errores  
- `chore:` configuración / estructura  
- `docs:` documentación  
- Ramas por feature:  
  - `feature/login-form`  
  - `feature/register-module`  
  - `feature/layout-navbar-static`  
  - etc.
=======
| Integrante | Rol Principal | Responsabilidades |
|-------------|----------------|------------------|
| **Integrante 1** | Líder Técnico / Scrum Master | Coordina el equipo, define arquitectura, integra código y gestiona el repositorio. |
| **Integrante 2** | Desarrollador UI/UX | Diseña la interfaz con Bootstrap, crea componentes visuales reutilizables y maquetas. |
| **Integrante 3** | Desarrollador Funcional | Implementa formularios, validaciones y comunicación entre componentes (`@Input`, `@Output`). |
| **Integrante 4** | Desarrollador de Servicios y Testing | Implementa servicios, guards de autenticación/autorización y pruebas básicas del proyecto. |

---

## Configuración inicial del proyecto

- **Framework:** Angular 15  
- **Librerías:** Bootstrap 5, jQuery, Popper.js  
- **Estilos globales:** `src/styles.scss`  
- **Rutas base:**
  - Cliente → `client/home`, `client/login`, `client/profile`, `client/catalog`, `client/cart`
  - Administrador → `admin/dashboard`, `admin/hotels`, `admin/events`
- **Estructura modular:**
  - `pages/client` → vistas del cliente  
  - `pages/admin` → vistas del administrador  
  - `components` → elementos reutilizables (navbar, footer, cards, etc.)  
  - `core` → servicios, guards, modelos e interfaces  
  - `shared` → recursos comunes (pipes, directivas, assets compartidos)
- **Navegación:**
  - Layouts `ClientComponent` y `AdminComponent` con rutas anidadas  
  - Redirección inicial a `client/home` y wildcard `**` dirigida al cliente
- **Versionado:** control con Git y GitHub · Convención de commits semánticos  
  - `feat:` nueva funcionalidad  
  - `chore:` configuración o estructura  
  - `docs:` documentación  
  - `fix:` corrección de errores  
>>>>>>> origin/mi-avance

---

## Estructura funcional actual

<<<<<<< HEAD
### Vistas del Cliente
- **Home** → página de inicio con hoteles destacados
- **Login** → autenticación con email/contraseña
- **Register** → registro de nuevos usuarios con selección de país
- **Profile** → información del usuario autenticado
- **Catalog** → listado de hoteles disponibles
- **Cart** → carrito de compras (estructura base)

### Vistas del Administrador
- **Dashboard** → resumen con estadísticas (total usuarios, hoteles, eventos, promedio ocupación)
- **Gestión de Hoteles** → CRUD completo de hoteles (crear, leer, actualizar, eliminar)
- **Gestión de Eventos** → CRUD completo de eventos
- **Gestión de Usuarios** → CRUD completo de usuarios (crear, leer, actualizar, eliminar)

> **Protección:** El acceso a cada vista se controla mediante `AuthGuard` (autenticación) y `RoleGuard` (rol requerido).

---

## ✔️ Funcionalidades implementadas / por implementar

| Concepto / Tecnología | Estado |
|-----------------------|:------:|
| **Interpolation** `{{ }}` | ✅ |
| **Template Reference** `#ref="ngForm"` | ✅ |
| **Property Binding** `[property]="value"` | ✅ |
| **Event Binding** `(click)="method()"` | ✅ |
| **Two-way Binding** `[(ngModel)]="var"` | ✅ |
| **Local Reference** `#variable` | ✅ |
| **Directivas:** `*ngIf`, `*ngFor`, `ng-container`, `ng-template` | ✅ |
| **Components, Services, Injection, Observables** | ✅ |
| **Models, Interfaces y DTOs** | ✅ |
| **Buenas prácticas de desarrollo** | ✅ |
| **Bootstrap 5 para interfaz gráfica** | ✅ |
| **Seguridad: Routes, Guards y control de roles** | ✅ |
| **Otros frameworks o librerías** | ☐ |


---

## Contenido funcional detallado del sistema

### Autenticación
- ✅ Login con email/contraseña
- ✅ Register con validación de campos y selección de país
- ✅ Logout
- ✅ Almacenamiento de sesión en localStorage
- ✅ Diferenciación de roles: ADMIN y CLIENT

### Vistas del Cliente
- ✅ Home con hoteles destacados
- ✅ Catálogo de hoteles consultable
- ✅ Perfil personal (solo si está autenticado)
- ✅ Carrito de compras (estructura base)
- ✅ Rutas protegidas con AuthGuard y RoleGuard

### Vistas del Administrador
- ✅ Dashboard con estadísticas:
  - Total de usuarios (usuarios ADMIN + CLIENT)
  - Total de hoteles
  - Total de eventos
  - Promedio de ocupación
- ✅ CRUD de Hoteles (crear, leer, actualizar, eliminar)
- ✅ CRUD de Eventos (crear, leer, actualizar, eliminar)
- ✅ CRUD de Usuarios (crear, leer, actualizar, eliminar)
- ✅ Todas las vistas protegidas con rol ADMIN

### Características Técnicas Implementadas
- ✅ Angular 15 con Standalone components ready
- ✅ Bootstrap 5.3.8 para diseño responsivo
- ✅ Observables y RxJS para operaciones asincrónicas
- ✅ Guards para protección de rutas
- ✅ Inyección de dependencias con `@Injectable`
- ✅ Validaciones en formularios (template-driven)
- ✅ Interpolación, property binding, event binding
- ✅ Two-way binding con `[(ngModel)]`
- ✅ Directivas `*ngIf`, `*ngFor`, `ng-container`, `ng-template`
- ✅ Template references `#ref="ngForm"` y `#ref="ngModel"`


---

## Estado del Proyecto

### **Sprint 1 – Configuración Inicial (✅ COMPLETADO)**  
- ✅ Configuración Angular 15 con dependencias
- ✅ Estructura modular por roles (client/admin)
- ✅ Layouts anidados y rutas configuradas
- ✅ Integración con GitHub
- ✅ Documentación inicial y setup

---

### **Sprint 2 – Módulo de Autenticación y Roles (✅ COMPLETADO)**  

#### ✅ Tareas Completadas
- **Login:** Componente con validación, autenticación simulada
- **Register:** Componente con campos validados y selección de país
- **AuthService:** Servicios de login, register, logout con BehaviorSubject
- **AuthGuard:** Protección de rutas por autenticación
- **RoleGuard:** Protección de rutas por rol de usuario
- **Navbar Dinámico:** Opciones diferentes según autenticación y rol
- **Flujo Navegación:** Coherencia entre módulos cliente y admin

#### 📊 Resultados Sprint 2
- **Autenticación:** Sistema completo de login/register/logout
- **Roles Funcionales:** Cliente (CLIENT) y Administrador (ADMIN)
- **Guards:** Protección bidireccional (auth + role)
- **Experiencia Usuario:** Navbar y redirecciones dinámicas
- **Código:** Commits semánticos, ramas por feature, integración en dev

---
## Próximos pasos (Sprint 3)

- Módulo de catálogo avanzado  
- Filtros y búsqueda  
- Reservas reales  
- Integración con servicios simulados (mock API)
=======
### Usuario Cliente
- **Login** → autenticación simulada con `AuthService`.  
- **Home** → vista principal de presentación.  
- **Catálogo** → listado de hoteles o servicios con filtros (NgFor, NgIf, property binding).  
- **Carrito de compras** → agrega reservas y simula pago (confirmación visual).  
- **Perfil** → datos del usuario actual (simulación de información persistida).

### Usuario Administrador
- **Dashboard** → resumen general del sistema.  
- **Gestión de Hoteles** → CRUD de productos/servicios (nombre, cantidad, precio).  
- **Gestión de Eventos** → administración de eventos y ocupación.

> Cada rol accede a su propio layout (`client` o `admin`), controlado por guards de autenticación y rol.

---

## Funcionalidades implementadas / por implementar

Marcar con ✅ cuando esté completado:

| Concepto / Tecnología | Estado |
|-----------------------|:------:|
| Interpolation | ☐ |
| Template Reference | ☐ |
| Property Binding | ☐ |
| Event Binding | ☐ |
| Two-way Binding | ☐ |
| Local Reference | ☐ |
| Directivas: `NgIf`, `NgIf-else`, `NgFor`, `@Input`, `@Output`, `@ViewChild` | ☐ |
| Generación de Components, Services, Injection, Observables y Promises | ☐ |
| Uso de Models, Enums, Interfaces y DTOs | ☐ |
| Buenas prácticas de desarrollo y versionado de código | ✅ |
| Uso de Bootstrap para la interfaz gráfica | ✅ |
| Seguridad: Routes, Guards y control de roles de usuarios | ☐ |
| Opcional: otros frameworks o librerías complementarias | ☐ |

---

## Contenido y Distribución Actual

- Login  
- Perfil de usuario  
- Catálogo de productos o servicios (nombre, cantidad, precio, etc.)  
- Carrito de compras  

**Vistas diferenciadas según rol:**

| Rol | Funcionalidades |
|-----|-----------------|
| **Administrador** | Crear, editar y eliminar productos/servicios (CRUD). |
| **Cliente** | Buscar, seleccionar y comprar productos/servicios (carrito de compras). |

---

## Buenas prácticas aplicadas

- Nomenclatura camelCase para variables y métodos.  
- Nomenclatura PascalCase para clases y componentes.  
- Separación de responsabilidades (Single Responsibility Principle).  
- Código comentado y modularizado.  
- Archivos y carpetas en minúsculas con guiones (`hotel-list.component.ts`).  
- Uso del operador de navegación segura (`?.`) en plantillas.  
- Commits semánticos y ramas por feature (`feature/auth`, `feature/catalog`, etc.).

---

## Estado del proyecto (Sprint 1)

- ✅ Configuración Angular y Bootstrap  
- ✅ Estructura modular por roles (Client/Admin)  
- ✅ Layouts con rutas anidadas  
- ✅ Repositorio y versionado activo  
- ✅ Roles y documentación inicial en README  
- ⏳ Pendiente inicio Sprint 2 (Login & Roles)
>>>>>>> origin/mi-avance

---

