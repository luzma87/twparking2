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

    let existingChargesFilter = {where: {month: month, year: year}};
    const existingCharges = await Charge.find(existingChargesFilter).catch(err => {
      cb(responseHelper.buildError(`error finding charges: ${err}`), 500);
    });
    if (existingCharges.length > 0) {
      console.log(`payments already found for ${monthYear}: nothing done`);
      return
    }

    console.log(`no payments found for ${monthYear}: creating`);
    let places = await Place.find({where: {isActive: true}}).catch(err => {
      cb(responseHelper.buildError(`error finding places: ${err}`), 500);
    });

    let total = 0;
    places.map(place => {
      total += place.price;
    });

    let otherChargesFilter = {where: {isActive: true}};
    let allOtherCharges = await OtherCharge.find(otherChargesFilter).catch(err => {
      cb(responseHelper.buildError(`error finding other charges: ${err}`), 500);
    });

    let otherBank = allOtherCharges.filter(charge => charge.code === 'OB');
    let otherCharges = allOtherCharges.filter(charge => charge.code !== 'OB');

    let peopleOtherBanksFilter = {where: {preferredPaymentMethod: 'OTRO'}};
    let people = await Person.find(peopleOtherBanksFilter).catch(err => {
      cb(responseHelper.buildError(`error finding people: ${err}`), 500);
    });

    const otherBankAmount = parseFloat(otherBank[0].amount);
    const peopleOtherBanks = parseFloat(people.length);
    total += (otherBankAmount * peopleOtherBanks);

    otherCharges.map(charge => {
      total += charge.amount;
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
      {arg: 'data', type: 'object', 'http': {source: 'body'}},
    ],
    returns: {
      arg: 'result',
      type: 'string',
    },
  });
};
