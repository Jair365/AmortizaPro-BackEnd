const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Boleta = sequelize.define('Boleta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  emisionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'emisiones',
      key: 'id'
    }
  },
  numeroPeriodo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // 0 para el período inicial, 1-N para los períodos de pago
  },
  tea: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true,
    // Solo para períodos > 0
  },
  tep: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true,
    // I' = TEP, solo para períodos > 0
  },
  pg: {
    type: DataTypes.STRING(1),
    allowNull: true,
    defaultValue: 'S',
    // Siempre S para períodos > 0
  },
  saldoInicial: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    // Capital en período 1, saldo final anterior en períodos siguientes
  },
  interes: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    // Saldo inicial * TEP
  },
  amortizacion: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    // Capital / número de cuotas
  },
  cuota: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    // Interés + Amortización
  },
  saldoFinal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    // Saldo inicial - Amortización
  },
  flujoInversionista: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    // Período 0: -(valor comercial - gastos), Períodos >0: cuota
  },
  flujoEmisor: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    // Período 0: valor comercial + gastos, Períodos >0: -cuota
  },
}, {
  timestamps: true,
  tableName: 'boletas',
});

module.exports = Boleta;
