'use strict';

const responseHelper = require('../responseHelper');

module.exports = function(Payment) {
  Payment.disableRemoteMethodByName('deleteById');

  const totalOwner = (owner) => {
    let total = 0;
    owner.places().map(place => {
      total += place.price;
    });
    return total;
  };

  const getExistingPayments = async (month, year, cb) => {
    let existingPaymentsFilter = { where: { month: month, year: year } };
    return await Payment.find(existingPaymentsFilter).catch(err => {
      cb(responseHelper.buildError(`error finding payments: ${err}`), 500);
    });
  };

  function prepareOwner(owner, month, year) {
    return {
      ownerId: owner.id,
      amount: totalOwner(owner),
      month: month,
      year: year,
      date: null,
    };
  }

  function insertPayments(owners, month, year, cb) {
    let monthYear = `${month} ${year}`;
    let paymentsInsert = [];
    owners.map(owner => {
      const ownerInsert = prepareOwner(owner, month, year);
      paymentsInsert.push(ownerInsert);
    });
    Payment.create(paymentsInsert, (err, res) => {
      if (err) {
        cb(responseHelper.buildError(`error inserting: ${err}`), 500);
      } else {
        cb(null, responseHelper.buildResponse(res, 201));
      }
    });
  }

  Payment.createForMonth = async (params, cb) => {
    const month = params.month.toUpperCase();
    const year = params.year;
    let monthYear = `${month} ${year}`;
    let Owner = Payment.app.models.Owner;

    const existingPayments = await getExistingPayments(month, year, cb);
    if (existingPayments.length > 0) {
      let message = `payments already found for ${monthYear}: nothing done`;
      cb(null, responseHelper.buildResponse(message));
      return;
    }

    let ownersFilter = { where: { isActive: true }, include: ['places'] };
    let owners = await Owner.find(ownersFilter).catch(err => {
      cb(responseHelper.buildError(`error finding owners: ${err}`), 500);
    });

    insertPayments(owners, month, year, cb);
  };

  Payment.remoteMethod('createForMonth', {
    description: 'Create payments to owners for given month and year',
    http: {
      path: '/createForMonth',
      verb: 'post',
      status: 201,
    },
    accepts: [
      { arg: 'data', type: 'object', 'http': { source: 'body' } },
    ],
    returns: {
      arg: 'result',
      type: 'string',
    },
  });
};
