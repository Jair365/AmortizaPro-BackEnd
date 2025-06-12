const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const config = require('../config/env');

exports.verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del encabezado de autorización
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar si el token existe
    if (!token) {
      return res.status(401).json({
        mensaje: 'No estás autenticado. Por favor inicia sesión para acceder.',
      });
    }

    // Verificar el token
    const decodificado = jwt.verify(token, config.JWT_SECRET);

    // Encontrar al usuario
    const usuarioActual = await Usuario.findByPk(decodificado.id);

    if (!usuarioActual) {
      return res.status(401).json({
        mensaje: 'El usuario asociado a este token ya no existe.',
      });
    }

    // Agregar el usuario a la solicitud
    req.usuario = usuarioActual;
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    return res.status(401).json({
      mensaje: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
    });
  }
};
