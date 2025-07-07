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

### Emisiones de Bonos

- **POST /api/emisiones**: Crear una nueva emisión (solo emisores)
  - Headers: `Authorization: Bearer [token]`
  - Body: `{ "nombreEmision": "string", "fechaEmision": "date", "capital": number, "numeroPeriodos": number, "tipoPeriodo": "años|meses", "cok": number, "tasaInteres": number, "tipoTasa": "TEM|TNM|TEB|TNB|TET|TNT|TES|TNS|TEA|TNA" }`
  - Response: `{ "mensaje": "string", "emision": {} }`

- **GET /api/emisiones/mis-emisiones**: Obtener emisiones del usuario actual (solo emisores)
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "emisiones": [] }`

- **GET /api/emisiones/mis-boletas**: Obtener todas las boletas de las emisiones del usuario actual (solo emisores)
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "totalEmisiones": number, "totalBoletas": number, "emisiones": [{ "emision": {}, "boletas": [] }] }`

- **GET /api/emisiones**: Obtener todas las emisiones disponibles
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "emisiones": [] }`

- **GET /api/emisiones/:id**: Obtener una emisión específica con sus boletas
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "emision": { "boletas": [] } }`

- **DELETE /api/emisiones/:id**: Eliminar una emisión (solo el propietario)
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string" }`

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

### Tabla: emisiones
- id: Identificador único (PK)
- nombreEmision: Nombre de la emisión del bono
- fechaEmision: Fecha de emisión del bono
- fechaVencimiento: Fecha de vencimiento del bono (calculada automáticamente basada en fecha de emisión + períodos)
- capital: Capital inicial del bono
- valorComercial: Capital × 98.5% (calculado automáticamente)
- numeroPeriodos: Número de períodos en meses
- tipoPeriodo: Tipo de período original ('años' o 'meses')
- gastosTransaccion: Capital × 5% (calculado automáticamente)
- cok: Costo de oportunidad del capital (siempre en TEA)
- tasaInteres: Tasa de interés original ingresada
- tipoTasa: Tipo de tasa ('TEM', 'TNM', 'TEB', 'TNB', 'TET', 'TNT', 'TES', 'TNS', 'TEA', 'TNA')
- temCalculada: Tasa efectiva mensual calculada para los cálculos
- usuarioId: ID del usuario emisor (FK)
- createdAt: Fecha de creación
- updatedAt: Fecha de actualización

### Tabla: boletas
- id: Identificador único (PK)
- emisionId: ID de la emisión (FK)
- periodo: Número del período (0 para período inicial, 1-N para períodos regulares)
- tea: Tasa efectiva anual (dato de entrada convertido)
- tep: Tasa efectiva del período (TEM para cálculos)
- pg: Período de gracia (siempre 'S')
- saldoInicial: Saldo inicial del período
- interes: Interés del período (Saldo Inicial × TEP)
- amortizacion: Amortización del período (Capital / Número de cuotas)
- cuota: Cuota del período (Interés + Amortización)
- saldoFinal: Saldo final del período (Saldo Inicial - Amortización)
- flujoInversionista: Flujo para el inversionista
- flujoEmisor: Flujo para el emisor (negativo de flujo inversionista)
- createdAt: Fecha de creación
- updatedAt: Fecha de actualización

## Relaciones entre tablas

- Un **usuario** puede tener muchas **emisiones** (1:N)
- Una **emisión** puede tener muchas **boletas** (1:N)
- Solo usuarios con rol "emisor" pueden crear emisiones
- Cada emisión genera automáticamente su tabla de amortización (boletas)