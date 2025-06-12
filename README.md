# AmortizaPro-BackEnd

Backend para la aplicación AmortizaPro, desarrollado con Node.js, Express y PostgreSQL.

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT para autenticación
- bcrypt para encriptación de contraseñas
- Swagger para documentación de API

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en el archivo `.env`
4. Asegurarse de tener PostgreSQL corriendo y crear la base de datos `amortizaPro`
5. Iniciar el servidor: `npm run dev`
6. Acceder a la documentación Swagger: `http://localhost:3000/api-docs`

## Endpoints de API

### Autenticación

- **POST /api/auth/register**: Registrar un nuevo usuario
  - Body: `{ "nombre": "string", "correo": "string", "contraseña": "string", "rol": "inversionista|emisor" }`
  - Response: `{ "mensaje": "string", "usuario": {}, "token": "string" }`

- **POST /api/auth/login**: Iniciar sesión
  - Body: `{ "correo": "string", "contraseña": "string" }`
  - Response: `{ "mensaje": "string", "usuario": {}, "token": "string" }`

- **GET /api/auth/perfil**: Obtener el perfil del usuario actual (requiere autenticación)
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "usuario": {} }`

- **GET /api/auth/emisor**: Acceso exclusivo para usuarios con rol "emisor"
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "data": {} }`

- **GET /api/auth/inversionista**: Acceso exclusivo para usuarios con rol "inversionista"
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "data": {} }`

## Base de datos

El sistema utiliza una base de datos PostgreSQL con las siguientes tablas:

### Tabla: usuarios
- id: Identificador único (PK)
- nombre: Nombre del usuario
- correo: Correo electrónico (único)
- contraseña: Contraseña encriptada
- rol: Rol del usuario ('inversionista' o 'emisor', por defecto 'inversionista')
- createdAt: Fecha de creación
- updatedAt: Fecha de actualización