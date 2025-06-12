/**
 * Middleware para verificar roles de usuario
 * @param {string[]} roles - Array con los roles permitidos
 * @returns {Function} - Middleware
 */
exports.verificarRol = (roles) => {
  return (req, res, next) => {
    // Verificar si el usuario ya fue autenticado por el middleware verificarToken
    if (!req.usuario) {
      return res.status(401).json({
        mensaje: 'No estás autenticado. Por favor inicia sesión para acceder.',
      });
    }

    // Verificar si el usuario tiene uno de los roles permitidos
    if (!roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        mensaje: 'No tienes permiso para acceder a este recurso.',
      });
    }

    // Si el usuario tiene el rol necesario, continuar
    next();
  };
};
