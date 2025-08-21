const express = require('express');
const emisionController = require('../controllers/emisionController');
const { validateEmision } = require('../middlewares/validationMiddleware');
const { verificarToken } = require('../middlewares/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Emision:
 *       type: object
 *       required:
 *         - nombreEmision
 *         - fechaEmision
 *         - fechaVencimiento
 *         - capital
 *         - numeroPeriodos
 *         - tipoPeriodo
 *         - cok
 *         - tasaInteres
 *         - tipoTasa
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado de la emisión
 *         nombreEmision:
 *           type: string
 *           description: Nombre de la emisión
 *         fechaEmision:
 *           type: string
 *           format: date
 *           description: Fecha de emisión del bono
 *         fechaVencimiento:
 *           type: string
 *           format: date
 *           description: Fecha de vencimiento del bono (calculada automáticamente)
 *         capital:
 *           type: number
 *           description: Capital del bono
 *         valorComercial:
 *           type: number
 *           description: Capital × 98.5% (calculado automáticamente)
 *         numeroPeriodos:
 *           type: integer
 *           description: Número de períodos
 *         tipoPeriodo:
 *           type: string
 *           enum: [años, meses]
 *           description: Tipo de período
 *         periodosEnMeses:
 *           type: integer
 *           description: Períodos convertidos a meses (calculado automáticamente)
 *         gastosTransaccion:
 *           type: number
 *           description: Capital × 5% (calculado automáticamente)
 *         cok:
 *           type: number
 *           description: COK siempre en TEA
 *         tasaInteres:
 *           type: number
 *           description: Tasa de interés
 *         tipoTasa:
 *           type: string
 *           enum: [TEM, TNM, TEB, TNB, TET, TNT, TES, TNS, TEA, TNA]
 *           description: Tipo de tasa de interés
 *         tasaEnTEM:
 *           type: number
 *           description: Tasa convertida a TEM (calculado automáticamente)
 *       example:
 *         nombreEmision: Bono Corporativo 2025
 *         fechaEmision: 2025-01-15
 *         capital: 10000
 *         numeroPeriodos: 30
 *         tipoPeriodo: meses
 *         cok: 12.5
 *         tasaInteres: 6.0
 *         tipoTasa: TEA
 *     
 *     Boleta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         numeroPeriodo:
 *           type: integer
 *           description: Número del período (0 para inicial)
 *         tea:
 *           type: number
 *           description: Tasa efectiva anual
 *         tep:
 *           type: number
 *           description: Tasa efectiva del período
 *         pg:
 *           type: string
 *           description: Indicador de pago
 *         saldoInicial:
 *           type: number
 *           description: Saldo al inicio del período
 *         interes:
 *           type: number
 *           description: Interés del período
 *         amortizacion:
 *           type: number
 *           description: Amortización del período
 *         cuota:
 *           type: number
 *           description: Cuota total del período
 *         saldoFinal:
 *           type: number
 *           description: Saldo al final del período
 *         flujoInversionista:
 *           type: number
 *           description: Flujo de caja del inversionista
 *         flujoEmisor:
 *           type: number
 *           description: Flujo de caja del emisor
 */

/**
 * @swagger
 * /api/emisiones:
 *   post:
 *     summary: Crear una nueva emisión de bonos (solo emisores)
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreEmision
 *               - fechaEmision
 *               - capital
 *               - numeroPeriodos
 *               - tipoPeriodo
 *               - cok
 *               - tasaInteres
 *               - tipoTasa
 *             properties:
 *               nombreEmision:
 *                 type: string
 *               fechaEmision:
 *                 type: string
 *                 format: date
 *               capital:
 *                 type: number
 *               numeroPeriodos:
 *                 type: integer
 *               tipoPeriodo:
 *                 type: string
 *                 enum: [años, meses]
 *               cok:
 *                 type: number
 *               tasaInteres:
 *                 type: number
 *               tipoTasa:
 *                 type: string
 *                 enum: [TEM, TNM, TEB, TNB, TET, TNT, TES, TNS, TEA, TNA]
 *             example:
 *               nombreEmision: Bono Corporativo 2025
 *               fechaEmision: 2025-01-15
 *               capital: 10000
 *               numeroPeriodos: 30
 *               tipoPeriodo: meses
 *               cok: 12.5
 *               tasaInteres: 6.0
 *               tipoTasa: TEA
 *     responses:
 *       201:
 *         description: Emisión creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 emision:
 *                   $ref: '#/components/schemas/Emision'
 *       403:
 *         description: Solo usuarios emisores pueden crear emisiones
 *       422:
 *         description: Error de validación
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, validateEmision, emisionController.crearEmision);

/**
 * @swagger
 * /api/emisiones/mis-emisiones:
 *   get:
 *     summary: Obtener las emisiones del usuario actual (solo emisores)
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emisiones obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 emisiones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Emision'
 *       403:
 *         description: Solo usuarios emisores pueden ver emisiones
 */
router.get('/mis-emisiones', verificarToken, emisionController.obtenerMisEmisiones);

/**
 * @swagger
 * /api/emisiones:
 *   get:
 *     summary: Obtener todas las emisiones disponibles
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Emisiones disponibles obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 emisiones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Emision'
 */
router.get('/', verificarToken, emisionController.obtenerTodasLasEmisiones);

/**
 * @swagger
 * /api/emisiones/mis-boletas:
 *   get:
 *     summary: Obtener todas las boletas de las emisiones del usuario actual (solo emisores)
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Boletas obtenidas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Boletas obtenidas correctamente
 *                 totalEmisiones:
 *                   type: integer
 *                   description: Número total de emisiones
 *                 totalBoletas:
 *                   type: integer
 *                   description: Número total de boletas
 *                 emisiones:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       emision:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nombreEmision:
 *                             type: string
 *                           fechaEmision:
 *                             type: string
 *                             format: date
 *                           capital:
 *                             type: number
 *                           numeroPeriodos:
 *                             type: integer
 *                       boletas:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Boleta'
 *       403:
 *         description: Solo los usuarios con rol de emisor pueden ver sus boletas
 */
router.get('/mis-boletas', verificarToken, emisionController.obtenerMisBoletas);

/**
 * @swagger
 * /api/emisiones/{id}:
 *   get:
 *     summary: Obtener una emisión específica con sus boletas
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Emisión obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 emision:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Emision'
 *                     - type: object
 *                       properties:
 *                         boletas:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Boleta'
 *       404:
 *         description: Emisión no encontrada
 */
router.get('/:id', verificarToken, emisionController.obtenerEmisionConBoletas);

/**
 * @swagger
 * /api/emisiones/{id}:
 *   delete:
 *     summary: Eliminar una emisión (solo el propietario)
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Emisión eliminada correctamente
 *       403:
 *         description: No tienes permisos para eliminar esta emisión
 *       404:
 *         description: Emisión no encontrada
 */
router.delete('/:id', verificarToken, emisionController.eliminarEmision);

/**
 * @swagger
 * /api/emisiones/{id}/indicadores-emisor:
 *   get:
 *     summary: Obtener indicadores de rentabilidad del emisor (COK período, TIR, TCEA, VAN)
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Indicadores calculados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cokPeriodo:
 *                   type: number
 *                   description: Tasa de descuento (COK) período mensual (%)
 *                 tirPeriodo:
 *                   type: number
 *                   description: TIR período de la operación (%)
 *                 tcea:
 *                   type: number
 *                   description: TCEA de la operación (%)
 *                 van:
 *                   type: number
 *                   description: VAN del emisor
 *       403:
 *         description: Solo usuarios emisores pueden ver estos indicadores
 *       404:
 *         description: Emisión no encontrada
 */
router.get('/:id/indicadores-emisor', verificarToken, emisionController.getIndicadoresEmisor);

/**
 * @swagger
 * /api/emisiones/{id}/indicadores-inversionista:
 *   get:
 *     summary: Obtener indicadores de rentabilidad del inversionista (COK período, TIR, TREA, VAN)
 *     tags: [Emisiones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la emisión
 *     responses:
 *       200:
 *         description: Indicadores calculados correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cokPeriodo:
 *                   type: number
 *                   description: Tasa de descuento (COK) período mensual (%)
 *                 tirPeriodo:
 *                   type: number
 *                   description: TIR período de la operación desde perspectiva del inversionista (%)
 *                 trea:
 *                   type: number
 *                   description: TREA (Tasa de Rendimiento Efectiva Anual) de la operación (%)
 *                 van:
 *                   type: number
 *                   description: VAN del inversionista
 *       403:
 *         description: Solo usuarios inversionistas pueden ver estos indicadores
 *       404:
 *         description: Emisión no encontrada
 */
router.get('/:id/indicadores-inversionista', verificarToken, emisionController.obtenerIndicadoresInversionista);

module.exports = router;
