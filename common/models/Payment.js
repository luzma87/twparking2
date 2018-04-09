'use strict';

module.exports = function(Payment) {
  Payment.disableRemoteMethodByName('deleteById');

  const buildError = (message, status = 400) => {
    const error = new Error(message);
    error.status = status;
    return error;
  };

  const buildResponse = (message, status = 200) => {
    return {status: status, result: message};
  };

  const totalOwner = (duenio) => {
    let total = 0;
    duenio.places().map(place => {
      total += place.price;
    });
    return total;
  };

  const prepareOwner = (owner, month, year, paymentsInsert) => {
    let payment = {
      ownerId: owner.id,
      amount: totalOwner(owner),
      month: month,
      year: year,
    };
    paymentsInsert.push(payment);
  };

  const prepareOwners = (owners, month, year) => {
    let paymentsInsert = [];
    owners.map(owner => {
      prepareOwner(owner, month, year, paymentsInsert);
    });
    return paymentsInsert;
  };

  Payment.createForMonth = (params, cb) => {
    const month = params.month.toUpperCase();
    const year = params.year;
    let Owner = Payment.app.models.Owner;
    let monthYear = `${month} ${year}`;

    console.log(`create payments for ${monthYear}`);

    console.log(`finding payments for ${monthYear}`);
    Payment.find({where: {month: month, year: year}}, (err, payments) => {
      if (err) {
        cb(buildError(`${month} is not a month ${err}`));
      } else {
        if (payments.length > 0) {
          console.log(`payments already found for ${monthYear}: nothing done`);
          cb(null, buildResponse('nothing done'));
        } else {
          console.log(`no payments found for ${monthYear}`);
          let filter = {where: {estaActivo: true}, include: ['places']};

          Owner.find(filter, (err, owners) => {
            if (err) {
              cb(buildError(`error finding owners: ${err}`), 500);
            }
            let pagosPuestoInsertar = prepareOwners(owners, month, year);
            Payment.create(pagosPuestoInsertar, (err, obj) => {
              if (err) {
                cb(buildError(`error inserting: ${err}`), 500);
              } else {
                console.log(`done creating payments for ${monthYear}`);
                cb(null, buildResponse('inserted', 201));
              }
            });
          });
        }
      }
    });
  };

  Payment.remoteMethod('createForMonth', {
    description: 'Create payments to owners for given month and year',
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
