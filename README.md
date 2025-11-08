# Marriott Hoteles – Proyecto Tecnologías Web

Proyecto grupal del ramo **Tecnologías Web** de Ingeniería Civil en Computación e Informática.  
El sistema implementa una **plataforma SPA en Angular** para la gestión de estancias y reservas en la cadena de hoteles Marriott, con **vistas diferenciadas por rol** (Cliente y Administrador).

---

## Equipo de trabajo

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

---

## Estructura funcional actual

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

---

