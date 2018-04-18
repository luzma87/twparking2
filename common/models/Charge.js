'use strict';

const responseHelper = require('../responseHelper');

module.exports = function(Charge) {
  Charge.disableRemoteMethodByName('deleteById');

  Charge.createForMonth = async (params, cb) => {
    const month = params.month.toUpperCase();
    const year = params.year;
    let monthYear = `${month} ${year}`;
    let Place = Charge.app.models.Place;
    let Person = Charge.app.models.Person;
    let OtherCharge = Charge.app.models.OtherCharge;

    let existingChargesFilter = { where: { month: month, year: year } };
    const existingCharges = await Charge.find(existingChargesFilter).catch(err => {
      cb(responseHelper.buildError(`error finding charges: ${err}`), 500);
    });
    if (existingCharges.length > 0) {
      let message = `charges already found for ${monthYear}: nothing done`;
      cb(null, responseHelper.buildResponse(message));
      return;
    }

    let isActiveFilter = { where: { isActive: true } };
    let allOtherCharges = await OtherCharge.find(isActiveFilter).catch(err => {
      cb(responseHelper.buildError(`error finding other charges: ${err}`), 500);
    });
    let otherBank = allOtherCharges.filter(charge => charge.code === 'OB');
    let otherCharges = allOtherCharges.filter(charge => charge.code !== 'OB');
    let places = await Place.find({ where: { isActive: true } }).catch(err => {
      cb(responseHelper.buildError(`error finding places: ${err}`), 500);
    });
    let total = 0;
    places.map(place => {
      total += place.price;
    });

    let peopleOtherBanksFilter = { where: { preferredPaymentMethod: 'OTRO' } };
    let peopleOtherBanks = await Person.find(peopleOtherBanksFilter).catch(err => {
      cb(responseHelper.buildError(`error finding people: ${err}`), 500);
    });

    let string = otherBank.length > 0 ? otherBank[0].amount : '0';
    const otherBankAmount = parseFloat(string);
    const amountPeopleOtherBanks = parseFloat(peopleOtherBanks.length);
    total += (otherBankAmount * amountPeopleOtherBanks);

    otherCharges.map(charge => {
      total += charge.amount;
    });

    let activePeople = await Person.find(isActiveFilter).catch(err => {
      cb(responseHelper.buildError(`error finding people: ${err}`), 500);
    });

    const amount = total / activePeople.length;

    let chargesInsert = [];
    activePeople.map(person => {
      let charge = {
        year: year,
        month: month,
        amountDefault: amount,
        amountPerson: amount,
        amountPayed: 0,
        personId: person.id,
        date: null,
      };
      chargesInsert.push(charge);
    });

    await Charge.create(chargesInsert, (err, res) => {
      if (err) {
        cb(responseHelper.buildError(`error inserting charges: ${err}`), 500);
      } else {
        cb(null, responseHelper.buildResponse(res, 201));
      }
    });
  };

  Charge.remoteMethod('createForMonth', {
    description: 'Create charges to persons for given month and year',
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
      type: 'object',
    },
  });
};
