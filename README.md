# Marriott International – Proyecto Tecnologías Web

Proyecto grupal del ramo **Tecnologías Web** de Ingeniería Civil en Computación e Informática.  
El sistema implementa una **plataforma SPA en Angular** para la gestión integral de reservas hoteleras en la cadena Marriott International, con **vistas diferenciadas por rol** (Cliente y Administrador), sistema de autenticación robusto con encriptación, y funcionalidades avanzadas de búsqueda y reserva de habitaciones.

---

## Equipo de trabajo

| Rol                                                        | Responsabilidades Principales                                                                                                                 | Integrante Asignado                        |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Scrum Master / Líder de Proyecto**                       | Coordina tareas, merges, revisa buenas prácticas (nombres, estructura, comentarios) y programa módulos clave (routing general, guards, auth). | **Álvaro Lovera**                          |
| **Desarrollador de Interfaces (UI/UX + Frontend)**         | Diseña la estructura visual con Bootstrap, Navbar, Footer, Home y vistas cliente. Aporta commits HTML/CSS y componentes Angular.              | **Claudio Carvajal**, **Martín Castillo**  |
| **Desarrollador Funcional (Frontend + Lógica de Negocio)** | Implementa lógica de formularios, validaciones y comunicación entre componentes.                                                              | **Fernando Garrido**, **Claudio Carvajal** |
| **Desarrollador de Servicios y Testing**                   | Implementa `Services`, `Injection`, `Observables`, `Guards`, y realiza pruebas unitarias (`ng test`).                                         | **Álvaro Lovera**, **Martín Castillo**     |

---

## Configuración del proyecto

- **Framework:** Angular 15.2.0
- **TypeScript:** 4.9.4
- **Librerías:** Bootstrap 5.3.8, jQuery 3.7.1, Popper.js 1.16.1
- **Seguridad:** bcryptjs 2.4.3, crypto-js 4.2.0
- **Backend Mock:** json-server (puerto 3000)
- **RxJS:** 7.8.0
- **Estilos globales:** `src/styles.scss`

### Estructura modular

- `pages/client` → Vistas del cliente (home, login, register, profile, search-hotels, reserve-hotels, complete-booking, booking-confirmation, my-reservations, guest-reservations, digital-checkin, experiences, offers, groups)
- `pages/admin` → Vistas del administrador (dashboard, hotels, events, users, bookings, rooms, room-occupancy, group-hotels, group-requests)
- `components` → Elementos compartidos (navbar, footer)
- `core/services` → Servicios de inyección de dependencias (AuthService, EncryptionService, HotelService, BookingService, EventService, AdminUserService)
- `core/guards` → Protección de rutas (AuthGuard, RoleGuard, GuestGuard)
- `core/models` → Interfaces y tipos de datos (User, Hotel, Room, Booking, Event, etc.)
- `shared` → Recursos comunes (not-found page)

### Sistema de Seguridad Implementado

El proyecto implementa un robusto sistema de encriptación de doble capa:

#### **Encriptación bcrypt para Contraseñas**
- Hashing irreversible con sal única por contraseña
- 10 rondas de procesamiento (estándar de seguridad)
- Las contraseñas nunca se almacenan en texto plano
- Imposible recuperar la contraseña original

#### **Encriptación AES para Datos de Sesión**
- Encriptación simétrica AES-256 para datos en `localStorage`
- Protección contra manipulación de roles y datos de usuario
- Los datos de sesión son ilegibles sin la clave secreta

#### **Script de Migración**
- `scripts/hash-passwords.js` para hashear contraseñas existentes en `db.json`
- Actualización automática de contraseñas a formato bcrypt

---

## Rutas del Sistema

### Rutas Públicas (Cliente)

- `/client/home` → Página principal con ofertas, hoteles destacados, experiencias
- `/client/login` → Autenticación de usuario (protegido con GuestGuard)
- `/client/register` → Registro de nuevo usuario (protegido con GuestGuard)
- `/client/search-hotels` → Búsqueda de hoteles por destino y fechas
- `/client/experiences` → Experiencias y amenidades
- `/client/offers` → Ofertas y promociones exclusivas
- `/client/groups` → Búsqueda de hoteles para grupos
- `/client/guest-reservations` → Consulta de reservas sin login

### Rutas Protegidas (Cliente)

- `/client/profile` → Perfil del usuario (requiere AUTH + rol CLIENT)
- `/client/hotel/:id/availability` → Calendario de disponibilidad
- `/client/hotel/:id/rooms` → Selección de habitaciones
- `/client/hotel/:id/booking` → Completar reserva
- `/client/booking-confirmation/:code` → Confirmación de reserva
- `/client/my-reservations` → Mis reservas (requiere AUTH)
- `/client/check-in/:confirmationCode` → Check-in digital
- `/client/groups/request/:id` → Solicitud de reserva grupal
- `/client/groups/confirmation/:code` → Confirmación de reserva grupal

### Rutas Protegidas (Administrador)

- `/admin/dashboard` → Resumen estadístico (requiere AUTH + rol ADMIN)
- `/admin/hotels` → CRUD de hoteles (requiere AUTH + rol ADMIN)
- `/admin/events` → CRUD de eventos (requiere AUTH + rol ADMIN)
- `/admin/users` → Gestión de usuarios (requiere AUTH + rol ADMIN)
- `/admin/bookings` → Gestión de reservas (requiere AUTH + rol ADMIN)
- `/admin/rooms` → Gestión de habitaciones (requiere AUTH + rol ADMIN)
- `/admin/room-occupancy` → Ocupación de habitaciones (requiere AUTH + rol ADMIN)
- `/admin/group-hotels` → Hoteles para grupos (requiere AUTH + rol ADMIN)
- `/admin/group-requests` → Solicitudes grupales (requiere AUTH + rol ADMIN)

### Navegación y Protección de Rutas

- **Layouts independientes:**
  - `ClientComponent` → Contenedor para rutas cliente (con navbar y footer)
  - `AdminComponent` → Contenedor para rutas admin (con sidebar y header)

- **Guards implementados:**
  - `AuthGuard` → Verifica si el usuario está autenticado
  - `RoleGuard` → Verifica si el usuario tiene el rol requerido
  - `GuestGuard` → Redirige usuarios autenticados (para login/register)
  
- **Redirección inicial:** `/` → `/client/home`
- **Rutas no encontradas:** `**` → `/404` (NotFoundComponent)

### Versionado y Estándar de Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de errores
- `chore:` Configuración / estructura
- `docs:` Documentación
- `style:` Cambios de estilos
- Ramas por feature: `feature/nombre-funcionalidad`

---

## Funcionalidades Implementadas

### **Módulo de Autenticación y Seguridad**
- Login con email y contraseña hasheada (bcrypt)
- Register con validación completa y hashing automático
- Logout con limpieza de sesión encriptada
- Cambio de contraseña con verificación del hash anterior
- Protección de datos de sesión con AES-256
- Generación de tokens de sesión seguros
- Prevención de manipulación de roles en localStorage

### **Sistema de Búsqueda y Reservas**
- Búsqueda avanzada de hoteles por:
  - Destino (ciudad, país, nombre de hotel)
  - Fechas de check-in y check-out con validación
  - Número de huéspedes (adultos y niños)
  - Cantidad de habitaciones
- Calendario de disponibilidad de habitaciones
- Selección de habitaciones con galería de imágenes
- Modal de detalles de habitación con carrusel
- Flujo completo de reserva en 3 pasos
- Countdown timer de 15 minutos para reservas en proceso
- Sistema de descuentos para miembros Marriott (10%)
- Confirmación de reserva con código único
- Gestión de reservas personales
- Consulta de reservas sin login (con código de confirmación)
- Check-in digital

### **Sistema de Reservas Grupales**
- Búsqueda de hoteles aptos para grupos (10+ habitaciones)
- Formulario de solicitud de cotización grupal
- Gestión administrativa de solicitudes grupales
- Confirmación de reservas grupales

### **Panel de Administración**
- Dashboard con estadísticas en tiempo real:
  - Total de usuarios, hoteles, eventos
  - Reservas activas y completadas
  - Ingresos totales
  - Promedio de ocupación
- CRUD completo de hoteles con:
  - Información general (nombre, ubicación, categoría)
  - Múltiples imágenes
  - Gestión de servicios y amenidades
  - Control de estado (activo/inactivo)
- CRUD completo de habitaciones con:
  - Tipos de habitación
  - Precios y capacidad
  - Imágenes y descripciones
  - Control de disponibilidad
- Gestión de ocupación de habitaciones
- CRUD de eventos
- CRUD de usuarios con control de roles
- Gestión de reservas (ver, cancelar)
- Gestión de hoteles y solicitudes grupales

### **Interfaz de Usuario**
- Página principal (Home) con:
  - Hero section con búsqueda integrada
  - Carrusel de ofertas exclusivas (3 cards desktop, 1 mobile)
  - Sección "Únete a Marriott International"
  - Hoteles destacados (carrusel responsive)
  - Experiencias y amenidades (layout asimétrico)
  - Sección de inspiración
- Navbar dinámico según autenticación y rol
- Footer completo con:
  - Enlaces corporativos de Marriott reales
  - Principales destinos dinámicos con búsqueda integrada
  - Redes sociales vinculadas
- Diseño 100% responsive (320px - 1920px+)
- Paleta de colores corporativa Marriott
- Componentes reutilizables
- Animaciones y transiciones suaves
- Validaciones visuales en formularios

### **Gestión de Miembros**
- Sistema de membresía Marriott International
- Generación automática de Member ID
- Descuentos exclusivos para miembros (10%)
- Visualización de beneficios en perfil

---

## Funcionalidades y Conceptos Angular Aplicados

| Concepto / Tecnología | Estado |
|----------------------|:------:|
| Interpolation | ✅ |
| Property Binding | ✅ |
| Event Binding | ✅ |
| Two-way Binding | ✅ |
| Directivas estructurales (`NgIf`, `NgFor`) | ✅ |
| Comunicación entre componentes (`@Input`, `@Output`) | ✅ |
| Servicios e Inyección de dependencias | ✅ |
| Observables | ✅ |
| Guards y control de roles | ✅ |
| Modularización y buenas prácticas | ✅ |
| Diseño responsive con Bootstrap | ✅ |

---

## Metodología de Trabajo

El proyecto se desarrolló mediante **sprints**, utilizando **tareas en lugar de historias de usuario** por razones de tiempo y organización, manteniendo igualmente una correcta planificación y seguimiento del avance mediante un **backlog centralizado**.

### Sprints Realizados

#### **Sprint 1 – Configuración Inicial (COMPLETADO)**
- Configuración Angular 15 con dependencias
- Estructura modular por roles (client/admin)
- Layouts anidados y rutas configuradas
- Integración con GitHub
- Documentación inicial y setup

#### **Sprint 2 – Módulo de Autenticación y Roles (COMPLETADO)**
- Sistema completo de login/register/logout
- AuthService con BehaviorSubject
- AuthGuard, RoleGuard, GuestGuard
- Navbar dinámico según rol
- Protección bidireccional de rutas

#### **Sprint 3 – Sistema de Búsqueda y Reservas (COMPLETADO)**
- Búsqueda avanzada de hoteles
- Calendario de disponibilidad
- Selección de habitaciones
- Flujo completo de reserva
- Confirmación y gestión de reservas
- Check-in digital

#### **Sprint 4 – Panel de Administración (COMPLETADO)**
- Dashboard con estadísticas
- CRUD completo de hoteles y habitaciones
- CRUD de eventos y usuarios
- Gestión de reservas y ocupación

#### **Sprint 5 – Interfaz de Usuario y Seguridad (COMPLETADO)**
- Diseño completo de Home con todas las secciones
- Footer y Navbar finalizados
- Sistema de encriptación bcrypt + AES
- Responsive design completo
- Reservas grupales
- Integración final de componentes

---

## Estado Final del Proyecto

- Configuración completa del entorno Angular
- Estructura modular por roles
- Sistema de autenticación y autorización con encriptación
- Guards y navegación protegida (AuthGuard, RoleGuard, GuestGuard)
- Sistema completo de búsqueda y reservas
- Panel administrativo con todas las funcionalidades CRUD
- Interfaz responsive y pulida (320px - 1920px+)
- Sistema de membresía con descuentos
- Reservas grupales funcionales
- Documentación de seguridad completa
- Gestión de código con Git y GitHub
- Proyecto funcional y listo para demostración

---

## Tecnologías y Librerías Utilizadas

### Core
- **Angular 15.2.0** - Framework principal
- **TypeScript 4.9.4** - Lenguaje de programación
- **RxJS 7.8.0** - Programación reactiva

### UI/UX
- **Bootstrap 5.3.8** - Framework CSS
- **SCSS** - Preprocesador CSS
- **jQuery 3.7.1** - Manipulación DOM
- **Popper.js 1.16.1** - Tooltips y popovers

### Seguridad
- **bcryptjs 2.4.3** - Hashing de contraseñas
- **crypto-js 4.2.0** - Encriptación AES

### Backend Mock
- **json-server** - API REST simulada
- **concurrently** - Ejecución simultánea de procesos

---

## Conclusión

El proyecto cumple con los requerimientos técnicos y académicos del ramo, demostrando el uso correcto de Angular, buenas prácticas de desarrollo frontend, trabajo colaborativo y gestión de código. 

Se ha implementado un sistema completo de gestión hotelera con:
- **Seguridad robusta** mediante encriptación de doble capa (bcrypt + AES)
- **Experiencia de usuario pulida** con diseño responsive y animaciones
- **Arquitectura escalable** con modularización y separación de responsabilidades
- **Funcionalidades avanzadas** como búsqueda multi-criterio, calendario de disponibilidad, sistema de reservas completo y panel administrativo completo

El proyecto deja una base sólida para una posible integración futura con backend real, base de datos persistente, sistemas de pago, y funcionalidades adicionales como notificaciones en tiempo real y análisis de datos.
