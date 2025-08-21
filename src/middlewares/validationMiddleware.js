const { body, validationResult } = require('express-validator');

exports.validateRegister = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  
  body('correo')
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido'),
  
  body('contraseña')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
    
  body('rol')
    .optional()
    .isIn(['inversionista', 'emisor'])
    .withMessage('El rol debe ser "inversionista" o "emisor"'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        mensaje: 'Error de validación',
        errores: errors.array() 
      });
    }
    next();
  }
];

exports.validateLogin = [
  body('correo')
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio')
    .isEmail()
    .withMessage('Debe proporcionar un correo electrónico válido'),
  
  body('contraseña')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        mensaje: 'Error de validación',
        errores: errors.array() 
      });
    }
    next();
  }
];

exports.validateEmision = [
  body('nombreEmision')
    .notEmpty()
    .withMessage('El nombre de la emisión es obligatorio')
    .isLength({ min: 3, max: 200 })
    .withMessage('El nombre debe tener entre 3 y 200 caracteres'),
  
  body('fechaEmision')
    .notEmpty()
    .withMessage('La fecha de emisión es obligatoria')
    .isISO8601()
    .withMessage('La fecha de emisión debe ser válida'),
  
  body('capital')
    .notEmpty()
    .withMessage('El capital es obligatorio')
    .isFloat({ min: 1000 })
    .withMessage('El capital debe ser mayor a 1000'),
  
  body('numeroPeriodos')
    .notEmpty()
    .withMessage('El número de períodos es obligatorio')
    .isInt({ min: 1, max: 360 })
    .withMessage('El número de períodos debe ser entre 1 y 360'),
  
  body('tipoPeriodo')
    .notEmpty()
    .withMessage('El tipo de período es obligatorio')
    .isIn(['años', 'meses'])
    .withMessage('El tipo de período debe ser "años" o "meses"'),
  
  body('cok')
    .notEmpty()
    .withMessage('El COK es obligatorio')
    .isFloat({ min: 0, max: 100 })
    .withMessage('El COK debe ser un porcentaje válido entre 0 y 100'),
  
  body('tasaInteres')
    .notEmpty()
    .withMessage('La tasa de interés es obligatoria')
    .isFloat({ min: 0, max: 100 })
    .withMessage('La tasa de interés debe ser un porcentaje válido entre 0 y 100'),
  
  body('tipoTasa')
    .notEmpty()
    .withMessage('El tipo de tasa es obligatorio')
    .isIn(['TEM', 'TNM', 'TEB', 'TNB', 'TET', 'TNT', 'TES', 'TNS', 'TEA', 'TNA'])
    .withMessage('El tipo de tasa debe ser uno de los valores válidos'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        mensaje: 'Error de validación',
        errores: errors.array() 
      });
    }
    next();
  }
];

exports.validateConexion = [
  body('emisorId')
    .notEmpty()
    .withMessage('El ID del emisor es obligatorio')
    .isInt({ min: 1 })
    .withMessage('El ID del emisor debe ser un número entero válido'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ 
        mensaje: 'Error de validación',
        errores: errors.array() 
      });
    }
    next();
  }
];
