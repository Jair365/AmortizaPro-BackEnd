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
