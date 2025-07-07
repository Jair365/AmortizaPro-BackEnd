const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Emision = sequelize.define('Emision', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  nombreEmision: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaEmision: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fechaVencimiento: {
    type: DataTypes.DATE,
    allowNull: false,
    // Se calcula automáticamente: fechaEmision + periodosEnMeses
  },
  capital: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  valorComercial: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    // Se calcula como capital * 0.985
  },
  numeroPeriodos: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tipoPeriodo: {
    type: DataTypes.ENUM('años', 'meses'),
    allowNull: false,
  },
  periodosEnMeses: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Si es años, se multiplica por 12
  },
  gastosTransaccion: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    // Se calcula como capital * 0.05
  },
  cok: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: false,
    // Siempre en TEA
  },
  tasaInteres: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: false,
  },
  tipoTasa: {
    type: DataTypes.ENUM('TEM', 'TNM', 'TEB', 'TNB', 'TET', 'TNT', 'TES', 'TNS', 'TEA', 'TNA'),
    allowNull: false,
  },
  tasaEnTEM: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: false,
    // Tasa convertida siempre a TEM para cálculos
  },
}, {
  timestamps: true,
  tableName: 'emisiones',
});

module.exports = Emision;
