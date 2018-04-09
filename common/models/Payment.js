'use strict';

const responseHelper = require('../responseHelper');

module.exports = function(Payment) {
  Payment.disableRemoteMethodByName('deleteById');

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

  let insertPayments = function(monthYear, Owner, cb, month, year) {
    console.log(`no payments found for ${monthYear}`);
    let filter = {where: {estaActivo: true}, include: ['places']};

    Owner.find(filter, (err, owners) => {
      if (err) {
        cb(responseHelper.buildError(`error finding owners: ${err}`), 500);
      }
      let pagosPuestoInsertar = prepareOwners(owners, month, year);
      Payment.create(pagosPuestoInsertar, (err) => {
        if (err) {
          cb(responseHelper.buildError(`error inserting: ${err}`), 500);
        } else {
          console.log(`done creating payments for ${monthYear}`);
          cb(null, responseHelper.buildResponse('inserted', 201));
        }
      });
    });
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
        cb(responseHelper.buildError(`${month} is not a month ${err}`));
      } else {
        if (payments.length > 0) {
          console.log(`payments already found for ${monthYear}: nothing done`);
          cb(null, responseHelper.buildResponse('nothing done'));
        } else {
          insertPayments(monthYear, Owner, cb, month, year);
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
