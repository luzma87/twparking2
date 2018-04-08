'use strict';

module.exports = (PagoPuesto) => {
  PagoPuesto.disableRemoteMethodByName('deleteById');

  const totalDuenio = function(duenio) {
    let total = 0;
    duenio.puestos().map(puesto => {
      total += puesto.precio;
    });
    return total;
  };

  const prepareDuenio = function(duenio, mes, anio, pagosPuestoInsertar) {
    let pagoPuesto = {
      duenioId: duenio.id,
      monto: totalDuenio(duenio),
      mes: mes,
      anio: anio,
    };
    pagosPuestoInsertar.push(pagoPuesto);
  };

  const prepareDuenios = function(duenios, mes, anio) {
    let pagosPuestoInsertar = [];
    duenios.map(duenio => {
      prepareDuenio(duenio, mes, anio, pagosPuestoInsertar);
    });
    return pagosPuestoInsertar;
  };

  PagoPuesto.createForMonth = (params, cb) => {
    const mes = params.mes;
    const anio = params.anio;
    let Duenio = PagoPuesto.app.models.Duenio;

    console.log(`creando pagos para ${mes} ${anio}`);

    console.log(`verificando si existen pagos para ${mes} ${anio}`);
    PagoPuesto.find({where: {mes: mes, anio: anio}}, (err, pagos) => {
      if (err) throw err;
      if (pagos.length > 0) {
        console.log(`ya existen pagos para ${mes} ${anio}, nothing done`);
        cb(null, 'nothing done');
      } else {
        console.log(`no existen pagos para ${mes} ${anio}`);
        let filter = {where: {estaActivo: true}, include: ['puestos']};

        Duenio.find(filter, (err, duenios) => {
          if (err) throw err;
          let pagosPuestoInsertar = prepareDuenios(duenios, mes, anio);
          PagoPuesto.create(pagosPuestoInsertar, (err, obj) => {
            if (err) throw err;
            console.log(`done creating pagos para ${mes} ${anio}`);
            cb(null, obj);
          });
        });
      }
    });
  };

  PagoPuesto.remoteMethod('createForMonth', {
    description: 'Create payments for given month and year',
    http: {
      path: '/createForMonth',
      verb: 'post',
      status: 201,
    },
    accepts: [
      {arg: 'data', type: 'object', 'http': {source: 'body'}},
    ],
    returns: {
      arg: 'result',
      type: 'object',
    },
  });
};
