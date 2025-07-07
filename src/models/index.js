const Usuario = require('./usuario');
const Emision = require('./emision');
const Boleta = require('./boleta');

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

module.exports = {
  Usuario,
  Emision,
  Boleta
};
