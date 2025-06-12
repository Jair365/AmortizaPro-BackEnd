const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');
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
 *     summary: Acceso exclusivo para emisores
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso concedido para emisor
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado, solo para emisores
 */
router.get('/emisor', verificarToken, verificarRol(['emisor']), (req, res) => {
  res.json({
    mensaje: 'Acceso para emisores concedido',
    data: {
      info: 'Esta es información exclusiva para emisores'
    }
  });
});

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

module.exports = router;
