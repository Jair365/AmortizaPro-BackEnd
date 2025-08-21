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

// Controlador para obtener todos los usuarios emisores
exports.obtenerEmisores = async (req, res) => {
  try {
    console.log('Obteniendo usuarios emisores...');
    
    // Buscar todos los usuarios con rol "emisor"
    const emisores = await Usuario.findAll({
      where: { rol: 'emisor' },
      attributes: ['id', 'nombre', 'correo', 'rol', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Se encontraron ${emisores.length} emisores`);
    
    // Si no hay emisores, devolver array vacío pero con mensaje informativo
    if (emisores.length === 0) {
      return res.status(200).json({
        mensaje: 'No hay usuarios emisores registrados',
        emisores: []
      });
    }

    return res.status(200).json({
      mensaje: 'Emisores obtenidos correctamente',
      total: emisores.length,
      emisores: emisores.map(emisor => ({
        id: emisor.id,
        nombre: emisor.nombre,
        correo: emisor.correo,
        rol: emisor.rol,
        createdAt: emisor.createdAt,
        updatedAt: emisor.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener emisores:', error);
    return res.status(500).json({ 
      mensaje: 'Error en el servidor', 
      error: error.message 
    });
  }
};

// Controlador para obtener todos los usuarios (solo para debugging)
exports.obtenerTodosLosUsuarios = async (req, res) => {
  try {
    console.log('Obteniendo todos los usuarios...');
    
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'correo', 'rol', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Total de usuarios: ${usuarios.length}`);
    usuarios.forEach(user => {
      console.log(`Usuario: ${user.nombre}, Rol: ${user.rol}`);
    });

    return res.status(200).json({
      mensaje: 'Todos los usuarios obtenidos',
      total: usuarios.length,
      usuarios: usuarios.map(usuario => ({
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return res.status(500).json({ 
      mensaje: 'Error en el servidor', 
      error: error.message 
    });
  }
};

// Controlador para crear una conexión entre inversionista y emisor
exports.crearConexion = async (req, res) => {
  try {
    const { emisorId } = req.body;
    const inversionistaId = req.usuario.id;

    // Verificar que el usuario sea inversionista
    if (req.usuario.rol !== 'inversionista') {
      return res.status(403).json({
        mensaje: 'Solo los inversionistas pueden crear conexiones con emisores'
      });
    }

    // Verificar que el emisor existe y tiene rol de emisor
    const emisor = await Usuario.findByPk(emisorId);
    if (!emisor) {
      return res.status(404).json({
        mensaje: 'Emisor no encontrado'
      });
    }

    if (emisor.rol !== 'emisor') {
      return res.status(400).json({
        mensaje: 'El usuario especificado no es un emisor'
      });
    }

    // Verificar que el inversionista no se esté conectando a sí mismo
    if (inversionistaId === emisorId) {
      return res.status(400).json({
        mensaje: 'No puedes conectarte contigo mismo'
      });
    }

    // Verificar si ya existe una conexión
    const { Conexion } = require('../models');
    const conexionExistente = await Conexion.findOne({
      where: {
        inversionistaId,
        emisorId
      }
    });

    if (conexionExistente) {
      if (conexionExistente.estado === 'activa') {
        return res.status(400).json({
          mensaje: 'Ya tienes una conexión activa con este emisor'
        });
      } else {
        // Reactivar conexión existente
        conexionExistente.estado = 'activa';
        await conexionExistente.save();
        
        return res.status(200).json({
          mensaje: 'Conexión reactivada exitosamente',
          conexion: {
            id: conexionExistente.id,
            emisor: {
              id: emisor.id,
              nombre: emisor.nombre,
              correo: emisor.correo
            },
            estado: conexionExistente.estado,
            fechaConexion: conexionExistente.updatedAt
          }
        });
      }
    }

    // Crear nueva conexión
    const nuevaConexion = await Conexion.create({
      inversionistaId,
      emisorId,
      estado: 'activa'
    });

    return res.status(201).json({
      mensaje: 'Conexión creada exitosamente',
      conexion: {
        id: nuevaConexion.id,
        emisor: {
          id: emisor.id,
          nombre: emisor.nombre,
          correo: emisor.correo
        },
        estado: nuevaConexion.estado,
        fechaConexion: nuevaConexion.createdAt
      }
    });

  } catch (error) {
    console.error('Error al crear conexión:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

// Controlador para obtener las conexiones del inversionista
exports.obtenerMisConexiones = async (req, res) => {
  try {
    // Verificar que el usuario sea inversionista
    if (req.usuario.rol !== 'inversionista') {
      return res.status(403).json({
        mensaje: 'Solo los inversionistas pueden ver sus conexiones'
      });
    }

    const { Conexion } = require('../models');
    const conexiones = await Conexion.findAll({
      where: {
        inversionistaId: req.usuario.id,
        estado: 'activa'
      },
      include: [{
        model: Usuario,
        as: 'emisor',
        attributes: ['id', 'nombre', 'correo']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      mensaje: 'Conexiones obtenidas correctamente',
      totalConexiones: conexiones.length,
      conexiones: conexiones.map(conexion => ({
        id: conexion.id,
        emisor: {
          id: conexion.emisor.id,
          nombre: conexion.emisor.nombre,
          correo: conexion.emisor.correo
        },
        fechaConexion: conexion.createdAt
      }))
    });

  } catch (error) {
    console.error('Error al obtener conexiones:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

// Controlador para eliminar una conexión
exports.eliminarConexion = async (req, res) => {
  try {
    const { emisorId } = req.params;
    const inversionistaId = req.usuario.id;

    // Verificar que el usuario sea inversionista
    if (req.usuario.rol !== 'inversionista') {
      return res.status(403).json({
        mensaje: 'Solo los inversionistas pueden eliminar conexiones'
      });
    }

    const { Conexion } = require('../models');
    const conexion = await Conexion.findOne({
      where: {
        inversionistaId,
        emisorId: parseInt(emisorId),
        estado: 'activa'
      }
    });

    if (!conexion) {
      return res.status(404).json({
        mensaje: 'Conexión no encontrada o ya está inactiva'
      });
    }

    // Marcar como inactiva en lugar de eliminar
    conexion.estado = 'inactiva';
    await conexion.save();

    return res.status(200).json({
      mensaje: 'Conexión eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar conexión:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

// Controlador para obtener emisiones de emisores conectados
exports.obtenerEmisionesConectadas = async (req, res) => {
  try {
    // Verificar que el usuario sea inversionista
    if (req.usuario.rol !== 'inversionista') {
      return res.status(403).json({
        mensaje: 'Solo los inversionistas pueden ver emisiones conectadas'
      });
    }

    const { Conexion, Emision } = require('../models');
    
    // Obtener IDs de emisores conectados
    const conexiones = await Conexion.findAll({
      where: {
        inversionistaId: req.usuario.id,
        estado: 'activa'
      },
      attributes: ['emisorId']
    });

    const emisoresIds = conexiones.map(conexion => conexion.emisorId);

    if (emisoresIds.length === 0) {
      return res.status(200).json({
        mensaje: 'No tienes conexiones activas con emisores',
        emisiones: []
      });
    }

    // Obtener emisiones de los emisores conectados
    const emisiones = await Emision.findAll({
      where: {
        usuarioId: emisoresIds
      },
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'correo']
      }],
      order: [['fechaEmision', 'DESC']]
    });

    return res.status(200).json({
      mensaje: 'Emisiones de emisores conectados obtenidas correctamente',
      totalEmisiones: emisiones.length,
      emisiones
    });

  } catch (error) {
    console.error('Error al obtener emisiones conectadas:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};
