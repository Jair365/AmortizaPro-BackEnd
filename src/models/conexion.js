const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conexion = sequelize.define('Conexion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  inversionistaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  emisorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  estado: {
    type: DataTypes.ENUM('activa', 'inactiva'),
    allowNull: false,
    defaultValue: 'activa'
  },
}, {
  timestamps: true,
  tableName: 'conexiones',
  indexes: [
    {
      unique: true,
      fields: ['inversionistaId', 'emisorId']
    }
  ]
});

module.exports = Conexion;
