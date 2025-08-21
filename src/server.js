const express = require('express');
const cors = require('cors');
const { sequelize, testDbConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const emisionRoutes = require('./routes/emisionRoutes');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
const config = require('./config/env');
const { setupSwagger } = require('./config/swagger');

// Importar modelos para establecer relaciones
require('./models');

// Inicializar express
const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar Swagger
setupSwagger(app);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/emisiones', emisionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de AmortizaPro funcionando correctamente' });
});

// Health check endpoint para Docker
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware para manejo de errores
app.use(notFound);
app.use(errorHandler);

// Sincronizar modelos con la base de datos
const sincronizarDB = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

// Iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Probar conexión a la base de datos
    await testDbConnection();
    
    // Sincronizar modelos
    await sincronizarDB();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

iniciarServidor();
