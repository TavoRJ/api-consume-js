# api-consume-js

**Proyecto full-stack (práctica)** — API REST con **Node.js + Express** conectada a **SQL Server** y un frontend simple en **HTML + Bootstrap + JavaScript (Fetch API)**.  
Desarrollado en **VS Code** por **Gustavo**.

---

## captura (opcional vere si lo agrego una imagen)

---

## Este proyecto se trabajo
- API básica con endpoints CRUD: `GET`, `POST`, `PUT`, `DELETE`.  
- Conexión a **SQL Server** (base `ApiDemoDB`) usando `mssql`.  
- Frontend estático que consume la API con `fetch`.  
- Estructura profesional: `backend/`, `frontend/`, `database/`.  
- Buenas prácticas: `.env.example`, `.gitignore`.

---

## Novedades en esta versión
- Nuevo **navbar lateral (left sidebar)** con navegación y tema profesional.  
- Diseño visual renovado usando **CSS** (fuente) + CSS compilado (styles.css).  
- Modal personalizado para **editar/crear productos** (mejora UX frente a `prompt()`).  
- Tabla de productos con formato de moneda ($xx.xx) — precios con **2 decimales**.  

---

## Características principales
- CRUD completo de `Productos`:
  - `GET /api/productos` — listar
  - `POST /api/productos` — crear `{ nombre, precio }`
  - `PUT /api/productos/:id` — actualizar `{ nombre, precio }`
  - `DELETE /api/productos/:id` — eliminar
- Frontend interactivo con:
  - Sidebar (left nav), tabla, modal de edición
  - Validación simple y feedback de UI

---

## Tech stack
- Backend: Node.js, Express, `mssql` (SQL Server)  
- Frontend: HTML5, CSS, JavaScript (ES6)  
- Herramientas: Git, GitHub, VS Code  
- Base de datos: SQL Server (ApiDemoDB)

---

## 📁 Estructura del repo (resumen - para futuro)
--- 

## Instalación y ejecución local (rápido)
1. Clonar:
```bash
git clone https://github.com/TavoRJ/api-consume-js.git
cd api-consume-js
```
---
## Instalar dependencias y correr backend
``` bash
cd backend
npm install
# ejecutar servidor
node server.js
# o con nodemon
npm run dev
```
Abre en el navegador: http://localhost:3000/index.html

---

## Contacto

Tavo RJ — rojas.gustavorj@gmail.com

Repositorio: https://github.com/TavoRJ/api-consume-js