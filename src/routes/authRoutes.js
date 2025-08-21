const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateConexion } = require('../middlewares/validationMiddleware');
const { verificarToken } = require('../middlewares/authMiddleware');
const { verificarRol } = require('../middlewares/roleMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nombre
 *         - correo
 *         - contraseña
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         correo:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario (debe ser único)
 *         contraseña:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario (se guardará cifrada)
 *         rol:
 *           type: string
 *           enum: [inversionista, emisor]
 *           description: Rol del usuario (inversionista o emisor)
 *       example:
 *         nombre: Juan Pérez
 *         correo: juan@ejemplo.com
 *         contraseña: contraseña123
 *         rol: inversionista
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - correo
 *               - contraseña
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               contraseña:
 *                 type: string
 *                 format: password
 *               rol:
 *                 type: string
 *                 enum: [inversionista, emisor]
 *                 description: Rol del usuario (por defecto es inversionista)
 *             example:
 *               nombre: Juan Pérez
 *               correo: juan@ejemplo.com
 *               contraseña: contraseña123
 *               rol: inversionista
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuario registrado correctamente
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
 *       400:
 *         description: Error en los datos proporcionados
 *       500:
 *         description: Error del servidor
 */
router.post('/register', validateRegister, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión con correo y contraseña
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contraseña
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *               contraseña:
 *                 type: string
 *                 format: password
 *             example:
 *               correo: juan@ejemplo.com
 *               contraseña: contraseña123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Inicio de sesión exitoso
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *                 token:
 *                   type: string
 *       401:
 *         description: Credenciales incorrectas
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/login', validateLogin, authController.login);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener el perfil del usuario actual
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Ruta protegida accedida correctamente
 *                 usuario:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado o token inválido
 */
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Ruta protegida accedida correctamente',
    usuario: {
      id: req.usuario.id,
      nombre: req.usuario.nombre,
      correo: req.usuario.correo,
      rol: req.usuario.rol,
      createdAt: req.usuario.createdAt,
      updatedAt: req.usuario.updatedAt
    }
  });
});

/**
 * @swagger
 * /api/auth/emisor:
 *   get:
 *     summary: Obtener todos los usuarios con rol de emisor
 *     tags: [Autenticación]
 *     responses:
 *       200:
 *         description: Lista de emisores obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Emisores obtenidos correctamente
 *                 total:
 *                   type: integer
 *                 emisores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       correo:
 *                         type: string
 *                         format: email
 *                       rol:
 *                         type: string
 *                         example: emisor
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Error del servidor
 */
router.get('/emisor', authController.obtenerEmisores);

/**
 * @swagger
 * /api/auth/inversionista:
 *   get:
 *     summary: Acceso exclusivo para inversionistas
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso concedido para inversionista
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado, solo para inversionistas
 */
router.get('/inversionista', verificarToken, verificarRol(['inversionista']), (req, res) => {
  res.json({
    mensaje: 'Acceso para inversionistas concedido',
    data: {
      info: 'Esta es información exclusiva para inversionistas'
    }
  });
});

/**
 * @swagger
 * /api/auth/emisores:
 *   get:
 *     summary: Obtener todos los usuarios con rol de emisor
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emisores obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Emisores obtenidos correctamente
 *                 emisores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       correo:
 *                         type: string
 *                         format: email
 *                       rol:
 *                         type: string
 *                         example: emisor
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/emisores', authController.obtenerEmisores);

/**
 * @swagger
 * /api/auth/usuarios-debug:
 *   get:
 *     summary: Obtener todos los usuarios (solo para debugging)
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Usuarios obtenidos correctamente
 *                 usuarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombre:
 *                         type: string
 *                       correo:
 *                         type: string
 *                         format: email
 *                       rol:
 *                         type: string
 *                         example: inversionista
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/usuarios-debug', authController.obtenerTodosLosUsuarios);

/**
 * @swagger
 * /api/auth/conectar:
 *   post:
 *     summary: Crear conexión con un emisor (solo inversionistas)
 *     tags: [Conexiones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emisorId
 *             properties:
 *               emisorId:
 *                 type: integer
 *                 description: ID del emisor con quien conectarse
 *             example:
 *               emisorId: 5
 *     responses:
 *       201:
 *         description: Conexión creada exitosamente
 *       400:
 *         description: Error en los datos o conexión ya existe
 *       403:
 *         description: Solo inversionistas pueden crear conexiones
 *       404:
 *         description: Emisor no encontrado
 */
router.post('/conectar', verificarToken, validateConexion, authController.crearConexion);

/**
 * @swagger
 * /api/auth/mis-conexiones:
 *   get:
 *     summary: Obtener las conexiones del inversionista actual
 *     tags: [Conexiones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conexiones obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 totalConexiones:
 *                   type: integer
 *                 conexiones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       emisor:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombre:
 *                             type: string
 *                           correo:
 *                             type: string
 *                       fechaConexion:
 *                         type: string
 *                         format: date-time
 *       403:
 *         description: Solo inversionistas pueden ver conexiones
 */
router.get('/mis-conexiones', verificarToken, authController.obtenerMisConexiones);

/**
 * @swagger
 * /api/auth/desconectar/{emisorId}:
 *   delete:
 *     summary: Eliminar conexión con un emisor
 *     tags: [Conexiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: emisorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del emisor a desconectar
 *     responses:
 *       200:
 *         description: Conexión eliminada exitosamente
 *       403:
 *         description: Solo inversionistas pueden eliminar conexiones
 *       404:
 *         description: Conexión no encontrada
 */
router.delete('/desconectar/:emisorId', verificarToken, authController.eliminarConexion);

/**
 * @swagger
 * /api/auth/emisiones-conectadas:
 *   get:
 *     summary: Obtener emisiones de emisores conectados (solo inversionistas)
 *     tags: [Conexiones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emisiones de emisores conectados obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 totalEmisiones:
 *                   type: integer
 *                 emisiones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Emision'
 *       403:
 *         description: Solo inversionistas pueden ver emisiones conectadas
 */
router.get('/emisiones-conectadas', verificarToken, authController.obtenerEmisionesConectadas);

module.exports = router;
