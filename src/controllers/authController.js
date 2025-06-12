const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

// Función para generar un token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    { 
      id: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN
    }
  );
};

// Controlador para el registro de usuarios
exports.register = async (req, res) => {
  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    // Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contraseña,
      rol: rol || 'inversionista' // Valor por defecto si no se especifica
    });

    // Generar token JWT
    const token = generarToken(nuevoUsuario);

    // Respuesta exitosa
    return res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// Controlador para el login de usuarios
exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Buscar el usuario por correo
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Verificar la contraseña
    const contraseñaValida = await usuario.validarContraseña(contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = generarToken(usuario);    // Respuesta exitosa
    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      },
      token
    });
  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};
