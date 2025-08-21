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

### Instalación con Docker (Recomendado)

La forma más sencilla de ejecutar la aplicación es usando Docker Compose:

```bash
# Clonar el repositorio
git clone <repository-url>
cd AmortizaPro-BackEnd

# Construir y ejecutar la aplicación completa (backend + PostgreSQL)
docker-compose up -d

# Verificar que los servicios estén funcionando
docker-compose ps

# Detener los servicios
docker-compose down
```

La aplicación estará disponible en:
- **API Backend**: http://localhost:3000
- **Documentación Swagger**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health
- **PostgreSQL**: localhost:5432

### Instalación tradicional (Desarrollo local)

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Asegurarse de tener PostgreSQL corriendo localmente
4. Crear la base de datos `amortizapro`
5. Iniciar el servidor: `npm run dev`

**Nota**: Con Docker no necesitas archivos `.env` ya que todas las variables están configuradas en el docker-compose.yml

## Comandos útiles de Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f amortizapro-backend

# Ver logs solo de la base de datos
docker-compose logs -f postgres

# Reiniciar solo el backend
docker-compose restart amortizapro-backend

# Acceder al contenedor del backend
docker exec -it amortizapro-backend sh

# Acceder a PostgreSQL
docker exec -it amortizapro-postgres psql -U postgres -d amortizapro

# Limpiar todo (contenedores, volúmenes, imágenes)
docker-compose down -v
docker system prune -a

# Reconstruir las imágenes
docker-compose build --no-cache
docker-compose up -d
```

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

### Conexiones entre Inversionistas y Emisores

- **POST /api/auth/conectar**: Crear conexión con un emisor (solo inversionistas)
  - Headers: `Authorization: Bearer [token]`
  - Body: `{ "emisorId": number }`
  - Response: `{ "mensaje": "string", "conexion": {} }`

- **GET /api/auth/mis-conexiones**: Obtener conexiones del inversionista actual
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "totalConexiones": number, "conexiones": [] }`

- **DELETE /api/auth/desconectar/:emisorId**: Eliminar conexión con un emisor
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string" }`

- **GET /api/auth/emisiones-conectadas**: Obtener emisiones de emisores conectados (solo inversionistas)
  - Headers: `Authorization: Bearer [token]`
  - Response: `{ "mensaje": "string", "totalEmisiones": number, "emisiones": [] }`

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

### Tabla: conexiones
- id: Identificador único (PK)
- inversionistaId: ID del usuario inversionista (FK)
- emisorId: ID del usuario emisor (FK)
- estado: Estado de la conexión ('activa' o 'inactiva', por defecto 'activa')
- createdAt: Fecha de creación
- updatedAt: Fecha de actualización

## Relaciones entre tablas

- Un **usuario** puede tener muchas **emisiones** (1:N)
- Una **emisión** puede tener muchas **boletas** (1:N)
- Un **inversionista** puede tener muchas **conexiones** con emisores (1:N)
- Un **emisor** puede tener muchas **conexiones** con inversionistas (1:N)
- Solo usuarios con rol "emisor" pueden crear emisiones
- Solo usuarios con rol "inversionista" pueden crear conexiones
- Cada emisión genera automáticamente su tabla de amortización (boletas)
- Las conexiones permiten a los inversionistas seguir emisores específicos