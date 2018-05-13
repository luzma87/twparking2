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

  const getExistingPayments = async (month, year) => {
    let existingPaymentsFilter = {where: {month: month, year: year}};
    return await Payment.find(existingPaymentsFilter).catch(err => {
      return responseHelper.buildError(`error finding payments: ${err}`, 500);
    });
  };

  const prepareOwner = (owner, month, year) => {
    return {
      ownerId: owner.id,
      amount: totalOwner(owner),
      month: month,
      year: year,
      date: null,
    };
  };

  const insertPayments = async (owners, month, year) => {
    let paymentsInsert = [];
    owners.map(owner => {
      const ownerInsert = prepareOwner(owner, month, year);
      paymentsInsert.push(ownerInsert);
    });
    const res = await Payment.create(paymentsInsert).catch(err => {
      return responseHelper.buildError(`error inserting: ${err}`, 500);
    });
    return responseHelper.buildResponse(res, 201);
  };

  Payment.createForMonth = async (params, cb) => {
    const month = params.month.toUpperCase();
    const year = params.year;
    let monthYear = `${month} ${year}`;
    let Owner = Payment.app.models.Owner;

    const existingPayments = await getExistingPayments(month, year);
    if (existingPayments.length > 0) {
      let message = `payments already found for ${monthYear}: nothing done`;
      return responseHelper.buildResponse(message);
    }

    let ownersFilter = {include: ['places'], where: {isActive: true}};
    let owners = await Owner.find(ownersFilter).catch(err => {
      return responseHelper.buildError(`error finding owners: ${err}`, 500);
    });
    return await insertPayments(owners, month, year);
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
