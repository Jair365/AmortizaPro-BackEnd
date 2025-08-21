const { Emision, Boleta, Usuario } = require('../models');
const { calcularValoresEmision, generarBoletas, calcularVAN, calcularTIR, calcularTCEA } = require('../utils/calculosFinancieros');

/**
 * Crear una nueva emisión de bonos
 */
const crearEmision = async (req, res) => {
  try {
    const {
      nombreEmision,
      fechaEmision,
      capital,
      numeroPeriodos,
      tipoPeriodo,
      cok,
      tasaInteres,
      tipoTasa
    } = req.body;

    // Verificar que el usuario sea emisor
    if (req.usuario.rol !== 'emisor') {
      return res.status(403).json({
        mensaje: 'Solo los usuarios con rol de emisor pueden crear emisiones'
      });
    }

    // Calcular valores derivados
    const valoresCalculados = calcularValoresEmision({
      capital: parseFloat(capital),
      numeroPeriodos: parseInt(numeroPeriodos),
      tipoPeriodo,
      tasaInteres: parseFloat(tasaInteres),
      tipoTasa
    });

    // Calcular fecha de vencimiento
    const fechaEmisionDate = new Date(fechaEmision);
    const fechaVencimiento = new Date(fechaEmisionDate);
    fechaVencimiento.setMonth(fechaVencimiento.getMonth() + valoresCalculados.periodosEnMeses);

    // Crear la emisión
    const nuevaEmision = await Emision.create({
      usuarioId: req.usuario.id,
      nombreEmision,
      fechaEmision: fechaEmisionDate,
      fechaVencimiento,
      capital: parseFloat(capital),
      valorComercial: valoresCalculados.valorComercial,
      numeroPeriodos: parseInt(numeroPeriodos),
      tipoPeriodo,
      periodosEnMeses: valoresCalculados.periodosEnMeses,
      gastosTransaccion: valoresCalculados.gastosTransaccion,
      cok: parseFloat(cok),
      tasaInteres: parseFloat(tasaInteres),
      tipoTasa,
      tasaEnTEM: valoresCalculados.tasaEnTEM
    });

    // Generar boletas de amortización
    const datosParaBoletas = {
      capital: parseFloat(capital),
      valorComercial: valoresCalculados.valorComercial,
      gastosTransaccion: valoresCalculados.gastosTransaccion,
      periodosEnMeses: valoresCalculados.periodosEnMeses,
      tasaEnTEM: valoresCalculados.tasaEnTEM,
      tasaInteres: parseFloat(tasaInteres),
      tipoTasa
    };

    const boletas = generarBoletas(datosParaBoletas);

    // Guardar boletas en la base de datos
    const boletasCreadas = await Promise.all(
      boletas.map(boleta => 
        Boleta.create({
          emisionId: nuevaEmision.id,
          ...boleta
        })
      )
    );

    // Respuesta exitosa
    return res.status(201).json({
      mensaje: 'Emisión creada correctamente',
      emision: {
        id: nuevaEmision.id,
        nombreEmision: nuevaEmision.nombreEmision,
        fechaEmision: nuevaEmision.fechaEmision,
        fechaVencimiento: nuevaEmision.fechaVencimiento,
        capital: nuevaEmision.capital,
        valorComercial: nuevaEmision.valorComercial,
        periodosEnMeses: nuevaEmision.periodosEnMeses,
        gastosTransaccion: nuevaEmision.gastosTransaccion,
        cok: nuevaEmision.cok,
        tasaInteres: nuevaEmision.tasaInteres,
        tipoTasa: nuevaEmision.tipoTasa,
        totalBoletas: boletasCreadas.length
      }
    });

  } catch (error) {
    console.error('Error al crear emisión:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Obtener todas las emisiones del usuario actual
 */
const obtenerMisEmisiones = async (req, res) => {
  try {
    // Verificar que el usuario sea emisor
    if (req.usuario.rol !== 'emisor') {
      return res.status(403).json({
        mensaje: 'Solo los usuarios con rol de emisor pueden ver emisiones'
      });
    }

    const emisiones = await Emision.findAll({
      where: { usuarioId: req.usuario.id },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      mensaje: 'Emisiones obtenidas correctamente',
      emisiones
    });

  } catch (error) {
    console.error('Error al obtener emisiones:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Obtener todas las emisiones disponibles para inversionistas
 */
const obtenerTodasLasEmisiones = async (req, res) => {
  try {
    const emisiones = await Emision.findAll({
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nombre', 'correo']
      }],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json({
      mensaje: 'Emisiones disponibles obtenidas correctamente',
      emisiones
    });

  } catch (error) {
    console.error('Error al obtener todas las emisiones:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Obtener una emisión específica con sus boletas
 */
const obtenerEmisionConBoletas = async (req, res) => {
  try {
    const { id } = req.params;

    const emision = await Emision.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'correo']
        },
        {
          model: Boleta,
          as: 'boletas',
          order: [['numeroPeriodo', 'ASC']]
        }
      ]
    });

    if (!emision) {
      return res.status(404).json({
        mensaje: 'Emisión no encontrada'
      });
    }

    return res.status(200).json({
      mensaje: 'Emisión obtenida correctamente',
      emision
    });

  } catch (error) {
    console.error('Error al obtener emisión:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Eliminar una emisión (solo el propietario)
 */
const eliminarEmision = async (req, res) => {
  try {
    const { id } = req.params;

    const emision = await Emision.findByPk(id);

    if (!emision) {
      return res.status(404).json({
        mensaje: 'Emisión no encontrada'
      });
    }

    // Verificar que el usuario sea el propietario
    if (emision.usuarioId !== req.usuario.id) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para eliminar esta emisión'
      });
    }

    // Eliminar boletas asociadas
    await Boleta.destroy({
      where: { emisionId: id }
    });

    // Eliminar emisión
    await emision.destroy();

    return res.status(200).json({
      mensaje: 'Emisión eliminada correctamente'
    });

  } catch (error) {
    console.error('Error al eliminar emisión:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Obtener todas las boletas de las emisiones del usuario actual
 */
const obtenerMisBoletas = async (req, res) => {
  try {
    // Verificar que el usuario sea emisor
    if (req.usuario.rol !== 'emisor') {
      return res.status(403).json({
        mensaje: 'Solo los usuarios con rol de emisor pueden ver sus boletas'
      });
    }

    // Obtener todas las boletas de las emisiones del usuario
    const boletas = await Boleta.findAll({
      include: [{
        model: Emision,
        as: 'emision',
        where: { usuarioId: req.usuario.id },
        attributes: ['id', 'nombreEmision', 'fechaEmision', 'capital', 'numeroPeriodos']
      }],
      order: [
        [{ model: Emision, as: 'emision' }, 'fechaEmision', 'DESC'],
        ['numeroPeriodo', 'ASC']
      ]
    });

    // Agrupar boletas por emisión para mejor organización
    const boletasAgrupadas = boletas.reduce((acc, boleta) => {
      const emisionId = boleta.emision.id;
      if (!acc[emisionId]) {
        acc[emisionId] = {
          emision: {
            id: boleta.emision.id,
            nombreEmision: boleta.emision.nombreEmision,
            fechaEmision: boleta.emision.fechaEmision,
            capital: boleta.emision.capital,
            numeroPeriodos: boleta.emision.numeroPeriodos
          },
          boletas: []
        };
      }
      
      acc[emisionId].boletas.push({
        id: boleta.id,
        periodo: boleta.numeroPeriodo,
        tea: boleta.tea,
        tep: boleta.tep,
        pg: boleta.pg,
        saldoInicial: boleta.saldoInicial,
        interes: boleta.interes,
        amortizacion: boleta.amortizacion,
        cuota: boleta.cuota,
        saldoFinal: boleta.saldoFinal,
        flujoInversionista: boleta.flujoInversionista,
        flujoEmisor: boleta.flujoEmisor
      });
      
      return acc;
    }, {});

    const resultado = Object.values(boletasAgrupadas);

    return res.status(200).json({
      mensaje: 'Boletas obtenidas correctamente',
      totalEmisiones: resultado.length,
      totalBoletas: boletas.length,
      emisiones: resultado
    });

  } catch (error) {
    console.error('Error al obtener mis boletas:', error);
    return res.status(500).json({
      mensaje: 'Error en el servidor',
      error: error.message
    });
  }
};

/**
 * Obtener indicadores de rentabilidad del emisor
 * - Tasa de descuento (COK) período (mensual)
 * - TIR período de la operación (flujo emisor)
 * - TCEA de la operación
 * - VAN del emisor
 */
const getIndicadoresEmisor = async (req, res) => {
  try {
    const { id } = req.params;
    // Solo emisores pueden consultar
    if (req.usuario.rol !== 'emisor') {
      return res.status(403).json({ mensaje: 'Solo los usuarios con rol de emisor pueden ver estos indicadores' });
    }
    // Buscar emisión y boletas
    const emision = await Emision.findByPk(id, {
      include: [{ model: Boleta, as: 'boletas', order: [['numeroPeriodo', 'ASC']] }]
    });
    if (!emision) {
      return res.status(404).json({ mensaje: 'Emisión no encontrada' });
    }
    // Ordenar boletas por periodo
    const boletas = (emision.boletas || []).sort((a, b) => a.numeroPeriodo - b.numeroPeriodo);
    // Flujo del emisor
    const flujoEmisor = boletas.map(b => Number(b.flujoEmisor));
    
    // COK período (mensual): convertir TEA a TEM
    const cokTEA = Number(emision.cok);
    const cokPeriodo = Math.pow(1 + cokTEA / 100, 1/12) - 1;
    
    // TIR del flujo emisor (mensual)
    const tirPeriodo = calcularTIR(flujoEmisor);
    
    // TCEA de la operación
    const tcea = calcularTCEA(tirPeriodo, 30);
    // VAN del emisor (a COK período)
    const van = calcularVAN(flujoEmisor, cokPeriodo);
    return res.json({
      cokPeriodo: cokPeriodo * 100, // % mensual
      tirPeriodo: tirPeriodo * 100, // % mensual
      tcea: tcea * 100, // % anual
      van
    });
  } catch (error) {
    console.error('Error en indicadores emisor:', error);
    return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

/**
 * Obtener indicadores financieros del inversionista para una emisión específica
 */
const obtenerIndicadoresInversionista = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Solo inversionistas pueden consultar
    if (req.usuario.rol !== 'inversionista') {
      return res.status(403).json({ mensaje: 'Solo los usuarios con rol de inversionista pueden ver estos indicadores' });
    }
    
    // Buscar emisión y boletas
    const emision = await Emision.findByPk(id, {
      include: [{ model: Boleta, as: 'boletas', order: [['numeroPeriodo', 'ASC']] }]
    });
    
    if (!emision) {
      return res.status(404).json({ mensaje: 'Emisión no encontrada' });
    }
    
    // Ordenar boletas por periodo
    const boletas = (emision.boletas || []).sort((a, b) => a.numeroPeriodo - b.numeroPeriodo);
    
    // Flujo del inversionista
    const flujoInversionista = boletas.map(b => Number(b.flujoInversionista));
    
    // COK período (mensual): convertir TEA a TEM
    const cokTEA = Number(emision.cok);
    const cokPeriodo = Math.pow(1 + cokTEA / 100, 1/12) - 1;
    
    // TIR del flujo inversionista (mensual)
    const tirPeriodo = calcularTIR(flujoInversionista);
    
    // TREA de la operación (misma fórmula que TCEA)
    const trea = calcularTCEA(tirPeriodo, 30);
    
    // VAN del inversionista (a COK período)
    const van = calcularVAN(flujoInversionista, cokPeriodo);
    
    return res.json({
      cokPeriodo: cokPeriodo * 100, // % mensual
      tirPeriodo: tirPeriodo * 100, // % mensual
      trea: trea * 100, // % anual
      van
    });
  } catch (error) {
    console.error('Error en indicadores inversionista:', error);
    return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = {
  crearEmision,
  obtenerMisEmisiones,
  obtenerTodasLasEmisiones,
  obtenerEmisionConBoletas,
  eliminarEmision,
  obtenerMisBoletas,
  getIndicadoresEmisor,
  obtenerIndicadoresInversionista
};
