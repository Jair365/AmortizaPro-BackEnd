/**
 * Funciones de cálculo financiero para emisión de bonos
 */

/**
 * Convierte cualquier tasa a TEM (Tasa Efectiva Mensual)
 */
const convertirATEM = (tasa, tipoTasa) => {
  const tasaDecimal = tasa / 100;
  
  switch (tipoTasa) {
    case 'TEM':
      return tasaDecimal;
    
    case 'TNM': // Tasa Nominal Mensual
      return tasaDecimal;
    
    case 'TEB': // Tasa Efectiva Bimestral
      return Math.pow(1 + tasaDecimal, 1/2) - 1;
    
    case 'TNB': // Tasa Nominal Bimestral
      return tasaDecimal / 2;
    
    case 'TET': // Tasa Efectiva Trimestral
      return Math.pow(1 + tasaDecimal, 1/3) - 1;
    
    case 'TNT': // Tasa Nominal Trimestral
      return tasaDecimal / 3;
    
    case 'TES': // Tasa Efectiva Semestral
      return Math.pow(1 + tasaDecimal, 1/6) - 1;
    
    case 'TNS': // Tasa Nominal Semestral
      return tasaDecimal / 6;
    
    case 'TEA': // Tasa Efectiva Anual
      return Math.pow(1 + tasaDecimal, 1/12) - 1;
    
    case 'TNA': // Tasa Nominal Anual
      return tasaDecimal / 12;
    
    default:
      throw new Error('Tipo de tasa no válido');
  }
};

/**
 * Calcula los valores derivados de la emisión
 */
const calcularValoresEmision = (datosEmision) => {
  const {
    capital,
    numeroPeriodos,
    tipoPeriodo,
    tasaInteres,
    tipoTasa
  } = datosEmision;

  // Calcular valores automáticos
  const valorComercial = capital * 0.985;
  const gastosTransaccion = capital * 0.05;
  
  // Convertir períodos a meses
  const periodosEnMeses = tipoPeriodo === 'años' ? numeroPeriodos * 12 : numeroPeriodos;
  
  // Convertir tasa a TEM
  const tasaEnTEM = convertirATEM(tasaInteres, tipoTasa);
  
  return {
    valorComercial,
    gastosTransaccion,
    periodosEnMeses,
    tasaEnTEM
  };
};

/**
 * Genera las boletas de amortización
 */
const generarBoletas = (emision) => {
  const boletas = [];
  const {
    capital,
    valorComercial,
    gastosTransaccion,
    periodosEnMeses,
    tasaEnTEM,
    tasaInteres,
    tipoTasa
  } = emision;

  // Boleta período 0 (inicial)
  const boletaInicial = {
    numeroPeriodo: 0,
    tea: null,
    tep: null,
    pg: null,
    saldoInicial: null,
    interes: null,
    amortizacion: null,
    cuota: null,
    saldoFinal: null,
    flujoInversionista: -(valorComercial - gastosTransaccion),
    flujoEmisor: valorComercial + gastosTransaccion
  };
  boletas.push(boletaInicial);

  // Cálculo de amortización constante
  const amortizacionConstante = capital / periodosEnMeses;
  
  // Generar boletas para cada período
  let saldoActual = capital;
  
  for (let periodo = 1; periodo <= periodosEnMeses; periodo++) {
    const interes = saldoActual * tasaEnTEM;
    const cuota = interes + amortizacionConstante;
    const saldoFinal = saldoActual - amortizacionConstante;
    
    const boleta = {
      numeroPeriodo: periodo,
      tea: tasaInteres, // Tasa original ingresada
      tep: tasaEnTEM * 100, // TEM convertida en porcentaje
      pg: 'S',
      saldoInicial: saldoActual,
      interes: interes,
      amortizacion: amortizacionConstante,
      cuota: cuota,
      saldoFinal: saldoFinal,
      flujoInversionista: cuota,
      flujoEmisor: -cuota
    };
    
    boletas.push(boleta);
    saldoActual = saldoFinal;
  }
  
  return boletas;
};

module.exports = {
  convertirATEM,
  calcularValoresEmision,
  generarBoletas
};
