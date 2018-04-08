'use strict';

module.exports = (PagoPuesto) => {
  PagoPuesto.disableRemoteMethodByName('deleteById');

  const buildError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
  };

  const buildResponse = (message, status = 200) => {
    return {status: status, result: message};
  };

  const totalDuenio = (duenio) => {
    let total = 0;
    duenio.puestos().map(puesto => {
      total += puesto.precio;
    });
    return total;
  };

  const prepareDuenio = (duenio, mes, anio, pagosPuestoInsertar) => {
    let pagoPuesto = {
      duenioId: duenio.id,
      monto: totalDuenio(duenio),
      mes: mes,
      anio: anio,
    };
    pagosPuestoInsertar.push(pagoPuesto);
  };

  const prepareDuenios = (duenios, mes, anio) => {
    let pagosPuestoInsertar = [];
    duenios.map(duenio => {
      prepareDuenio(duenio, mes, anio, pagosPuestoInsertar);
    });
    return pagosPuestoInsertar;
  };

  PagoPuesto.createForMonth = (params, cb) => {
    const mes = params.mes.toUpperCase();
    const anio = params.anio;
    let Duenio = PagoPuesto.app.models.Duenio;

    console.log(`creando pagos para ${mes} ${anio}`);

    console.log(`verificando si existen pagos para ${mes} ${anio}`);
    PagoPuesto.find({where: {mes: mes, anio: anio}}, (err, pagos) => {
      if (err) {
        cb(buildError(`${mes} is not a month ${err}`));
      } else {
        if (pagos.length > 0) {
          console.log(`ya existen pagos para ${mes} ${anio}, nothing done`);
          cb(null, buildResponse('nothing done'));
        } else {
          console.log(`no existen pagos para ${mes} ${anio}`);
          let filter = {where: {estaActivo: true}, include: ['puestos']};

          Duenio.find(filter, (err, duenios) => {
            if (err) {
              cb(buildError(`error finding duenios: ${err}`), 500);
            }
            let pagosPuestoInsertar = prepareDuenios(duenios, mes, anio);
            PagoPuesto.create(pagosPuestoInsertar, (err, obj) => {
              if (err) {
                cb(buildError(`error inserting: ${err}`), 500);
              } else {
                console.log(`done creating pagos para ${mes} ${anio}`);
                cb(null, buildResponse('inserted', 201));
              }
            });
          });
        }
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
      type: 'string',
    },
  });
};
