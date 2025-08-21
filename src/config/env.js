const dotenv = require('dotenv');

// Cargar variables de entorno desde el archivo .env (si existe)
dotenv.config();

module.exports = {
  // Base de datos - configuración para Docker
  DB_USERNAME: process.env.DB_USER || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'postgres123',
  DB_DATABASE: process.env.DB_NAME || 'amortizapro',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_DIALECT: 'postgres',
  
  // Servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'amortizapro-jwt-secret-2025',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
};
