const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('./env');

// Definición básica para Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de AmortizaPro',
      version: '1.0.0',
      description: 'Documentación de API REST para AmortizaPro',
      contact: {
        name: 'Equipo de AmortizaPro',
      },
      servers: [{
        url: `http://localhost:${config.PORT}`,
        description: 'Servidor de Desarrollo',
      }],
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],  // Archivos donde se encuentran las definiciones
};

// Inicializar swagger-jsdoc
const swaggerSpecs = swaggerJsdoc(swaggerOptions);

/**
 * Función para configurar Swagger en la app Express
 * @param {Express} app - La instancia de Express
 */
const setupSwagger = (app) => {
  // Ruta para la documentación de la API
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
  
  // Ruta para obtener el archivo swagger.json
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpecs);
  });
};

module.exports = { setupSwagger };
