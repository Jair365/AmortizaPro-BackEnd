/**
 * Funciones de cálculo financiero para emisión de bonos
 */

// Intentar cargar diferentes librerías de funciones financieras
let IRR_function = null;

try {
  const { IRR } = require('financial');
  IRR_function = IRR;
} catch (error) {
  try {
    const { IRR } = require('formulajs');
    IRR_function = IRR;
  } catch (error2) {
    // No se encontraron librerías, usar método manual
  }
}

/**
 * Convierte cualquier tasa a TEM (Tasa Efectiva Mensual)
 * Las tasas nominales utilizan capitalización diaria
 */
const convertirATEM = (tasa, tipoTasa) => {
  const tasaDecimal = tasa / 100;
  
  switch (tipoTasa) {
    case 'TEM':
      return tasaDecimal;
    
    case 'TNM': // Tasa Nominal Mensual (capitalización diaria)
      // TNM con capitalización diaria: (1 + TNM/30)^30 - 1
      return Math.pow(1 + tasaDecimal / 30, 30) - 1;
    
    case 'TEB': // Tasa Efectiva Bimestral
      return Math.pow(1 + tasaDecimal, 1/2) - 1;
    
    case 'TNB': // Tasa Nominal Bimestral (capitalización diaria)
      // TNB con capitalización diaria: (1 + TNB/60)^30 - 1 (para obtener TEM)
      return Math.pow(1 + tasaDecimal / 60, 30) - 1;
    
    case 'TET': // Tasa Efectiva Trimestral
      return Math.pow(1 + tasaDecimal, 1/3) - 1;
    
    case 'TNT': // Tasa Nominal Trimestral (capitalización diaria)
      // TNT con capitalización diaria: (1 + TNT/90)^30 - 1 (para obtener TEM)
      return Math.pow(1 + tasaDecimal / 90, 30) - 1;
    
    case 'TES': // Tasa Efectiva Semestral
      return Math.pow(1 + tasaDecimal, 1/6) - 1;
    
    case 'TNS': // Tasa Nominal Semestral (capitalización diaria)
      // TNS con capitalización diaria: (1 + TNS/180)^30 - 1 (para obtener TEM)
      return Math.pow(1 + tasaDecimal / 180, 30) - 1;
    
    case 'TEA': // Tasa Efectiva Anual
      return Math.pow(1 + tasaDecimal, 1/12) - 1;
    
    case 'TNA': // Tasa Nominal Anual (capitalización diaria)
      // TNA con capitalización diaria: (1 + TNA/360)^30 - 1 (para obtener TEM)
      return Math.pow(1 + tasaDecimal / 360, 30) - 1;
    
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
  const gastosTransaccion = capital * 0.01;
  
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

/**
 * Calcula el VAN de un flujo de caja
 * @param {number[]} flujos - Array de flujos de caja (periodo 0, 1, ...)
 * @param {number} tasa - Tasa de descuento (decimal, ej: 0.01)
 * @returns {number}
 */
function calcularVAN(flujos, tasa) {
  return flujos.reduce((acc, flujo, i) => acc + flujo / Math.pow(1 + tasa, i), 0);
}

/**
 * Calcula la TIR de un flujo de caja usando librerías financieras (similar a Excel)
 * @param {number[]} flujos - Array de flujos de caja (periodo 0, 1, ...)
 * @param {number} [guess=0.1] - Valor inicial de la TIR (decimal) - no se usa con librerías
 * @returns {number}
 */
function calcularTIR(flujos, guess = 0.1) {
  // Primero intentar con librerías financieras
  if (IRR_function) {
    try {
      const tir = IRR_function(flujos);
      
      // Verificar si el resultado es válido
      if (isNaN(tir) || !isFinite(tir)) {
        return calcularTIRManual(flujos, guess);
      }
      
      return tir;
    } catch (error) {
      return calcularTIRManual(flujos, guess);
    }
  } else {
    // Si no hay librerías disponibles, usar método manual
    return calcularTIRManual(flujos, guess);
  }
}

/**
 * Método manual de TIR como respaldo (Newton-Raphson mejorado)
 * @param {number[]} flujos - Array de flujos de caja
 * @param {number} guess - Valor inicial
 * @returns {number}
 */
function calcularTIRManual(flujos, guess = 0.1) {
  const maxIter = 1000;
  const precision = 1e-10;
  
  // Intentar con diferentes valores iniciales si no converge
  const guessValues = [guess, 0.1, 0.05, 0.15, 0.01, 0.5];
  
  for (let guessIndex = 0; guessIndex < guessValues.length; guessIndex++) {
    let tir = guessValues[guessIndex];
    let converged = false;
    
    for (let iter = 0; iter < maxIter; iter++) {
      let f = 0;
      let df = 0;
      
      // Calcular VAN y su derivada
      for (let t = 0; t < flujos.length; t++) {
        const factor = Math.pow(1 + tir, t);
        f += flujos[t] / factor;
        if (t > 0) {
          df -= t * flujos[t] / (factor * (1 + tir));
        }
      }
      
      // Verificar convergencia
      if (Math.abs(f) < precision) {
        converged = true;
        break;
      }
      
      // Evitar división por cero
      if (Math.abs(df) < 1e-15) break;
      
      // Actualizar TIR con amortiguación para evitar oscilaciones
      const delta = f / df;
      if (Math.abs(delta) > 0.5) {
        tir = tir - Math.sign(delta) * 0.5;
      } else {
        tir = tir - delta;
      }
      
      // Evitar tasas negativas muy extremas
      if (tir < -0.99) tir = -0.99;
    }
    
    if (converged) return tir;
  }
  
  // Si no converge, retornar NaN para indicar error
  return NaN;
}

/**
 * Calcula la TCEA a partir de la TIR del periodo
 * @param {number} tirPeriodo - TIR del periodo (decimal)
 * @param {number} diasPeriodo - Días del periodo (ej: 30)
 * @returns {number}
 */
function calcularTCEA(tirPeriodo, diasPeriodo = 30) {
  return Math.pow(1 + tirPeriodo, 360 / diasPeriodo) - 1;
}

module.exports = {
  convertirATEM,
  calcularValoresEmision,
  generarBoletas,
  calcularVAN,
  calcularTIR,
  calcularTCEA
};
