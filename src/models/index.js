const Usuario = require('./usuario');
const Emision = require('./emision');
const Boleta = require('./boleta');
const Conexion = require('./conexion');

// Relaciones entre Usuario y Emisión
Usuario.hasMany(Emision, { 
  foreignKey: 'usuarioId',
  as: 'emisiones'
});
Emision.belongsTo(Usuario, { 
  foreignKey: 'usuarioId',
  as: 'usuario'
});

// Relaciones entre Emisión y Boleta
Emision.hasMany(Boleta, { 
  foreignKey: 'emisionId',
  as: 'boletas'
});
Boleta.belongsTo(Emision, { 
  foreignKey: 'emisionId',
  as: 'emision'
});

// Relaciones para Conexiones
// Un inversionista puede tener muchas conexiones (siguiendo a muchos emisores)
Usuario.hasMany(Conexion, {
  foreignKey: 'inversionistaId',
  as: 'conexionesComoInversionista'
});

// Un emisor puede tener muchas conexiones (siendo seguido por muchos inversionistas)
Usuario.hasMany(Conexion, {
  foreignKey: 'emisorId',
  as: 'conexionesComoEmisor'
});

// Una conexión pertenece a un inversionista
Conexion.belongsTo(Usuario, {
  foreignKey: 'inversionistaId',
  as: 'inversionista'
});

// Una conexión pertenece a un emisor
Conexion.belongsTo(Usuario, {
  foreignKey: 'emisorId',
  as: 'emisor'
});

module.exports = {
  Usuario,
  Emision,
  Boleta,
  Conexion
};
