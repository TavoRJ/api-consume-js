# API-CONSTATE-JS  
Proyecto base full-stack (Node.js + SQL Server + Frontend simple)

Este proyecto fue creado **intencionalmente simple**, sirviendo como **plantilla base** para futuros proyectos más grandes y reales.  
La idea es tener una estructura clara, profesional y lista para escalar.

---

## Objetivo del proyecto
Construir un ejemplo funcional de:

- API REST con Node.js + Express  
- Conexión real a SQL Server  
- Frontend con HTML, CSS y JavaScript (fetch)  
- Sistema básico de Login con autenticación y protección de rutas  
- CRUD de productos  

Este proyecto NO pretende ser final; es una base sólida para evolucionarlo en proyectos futuros.

---

## Funcionalidades principales

### Autenticación
- Login funcional con usuario/contraseña desde SQL Server  
- Redirección automática según sesión  
- Protección para evitar acceder a `index.html` sin login  
- Cerrar sesión con limpieza de `sessionStorage`

### CRUD de Productos
- Crear, leer, actualizar y eliminar productos  
- Modal visual para edición y creación  
- Precios formateados a moneda con 2 decimales  
- Tabla interactiva conectada a la API vía fetch

### Frontend básico pero profesional
- Sidebar de navegación  
- Diseño limpio con CSS personalizado  
- `styles.css` compilado y mejor organizado  

---

## Tech Stack
### Backend  
- Node.js  
- Express  
- mssql (SQL Server)  
- bcrypt (hashing de contraseñas)  
- dotenv  

### Frontend  
- HTML5  
- CSS  
- JavaScript (Fetch API)

### Herramientas  
- VS Code  
- Git / GitHub  

---

## Estructura del repositorio (simple y limpia)
API-CONSUME-JS
├── backend
│   ├── .env.example
│   ├── auth.js
│   ├── db.js
│   ├── seed-admin.js
│   └── server.js
│
├── database
│   └── schema.sql
│
├── frontend
│   ├── index.html
│   ├── login.html
│   ├── login.js
│   ├── script.js
│   └── styles.css
│
├── img
│
├── .gitignore
└── README.md
---

# Cómo replicar este proyecto en cualquier computadora

## 1️ Clonar el repositorio
```bash
git clone https://github.com/TavoRJ/api-consume-js.git
cd api-consume-js
```
## 2️ Configurar la base de datos (SQL Server)
Abre SQL Server Management Studio
Crea una base llamada:
```bash
ApiDemoDB
```
Ejecuta dentro de esa base el archivo:
database/schema.sql
## 3 Ejecuta dentro de esa base el archivo:
``` bash
database/schema.sql
```
# Nota importante
Este proyecto es una base, no un sistema final.
Esta diseñado para:
- Experimentacion
- Aprendizaje
- Crear proyectos futuros mas profesional
- Usarlo como plantilla para APIs

---

# Contacto
rojas.gustavorj@gmail.com
GitHub: https://github.com/TavoRJ/api-consume-js