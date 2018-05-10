'use strict';

const _ = require('lodash');
const responseHelper = require('../responseHelper');

module.exports = function(Charge) {
  let isActiveFilter = {where: {isActive: true}};
  Charge.disableRemoteMethodByName('deleteById');

  const getPlacesTotal = async (Place) => {
    let places = await Place.find({where: {isActive: true}}).catch(err => {
      return responseHelper.buildError(`error finding places: ${err}`, 500);
    });
    let total = 0;
    places.map(place => {
      total += place.price;
    });
    return total;
  };

  const getPeopleOtherBanksTotal = async (Person, allOtherCharges) => {
    let otherBank = allOtherCharges.filter(charge => charge.code === 'OB');
    let peopleOtherBanksFilter = {where: {preferredPaymentMethod: 'OTRO'}};
    let peopleOtherBanks = await Person.find(peopleOtherBanksFilter).catch(err => {
      return responseHelper.buildError(`error finding people: ${err}`, 500);
    });

    let string = otherBank.length > 0 ? otherBank[0].amount : '0';
    const otherBankAmount = parseFloat(string);
    const amountPeopleOtherBanks = parseFloat(peopleOtherBanks.length);
    return (otherBankAmount * amountPeopleOtherBanks);
  };

  const getOtherChargesTotal = (allOtherCharges) => {
    let otherCharges = allOtherCharges.filter(charge => charge.code !== 'OB');
    let total = 0;
    otherCharges.map(charge => {
      total += charge.amount;
    });
    return total;
  };

  const getActivePeople = async (Person) => {
    return await Person.find(isActiveFilter).catch(err => {
      return responseHelper.buildError(`error finding people: ${err}`, 500);
    });
  };

  const getExistingCharges = async (month, year) => {
    let existingChargesFilter = {where: {month: month, year: year}};
    return await Charge.find(existingChargesFilter).catch(err => {
      return responseHelper.buildError(`error finding charges: ${err}`, 500);
    });
  };

  const prepareCharge = (year, month, amount, person) => {
    return {
      year: year,
      month: month,
      amountDefault: _.round(amount, 2),
      amountPerson: _.round(amount, 2),
      amountPayed: 0,
      personId: person.id,
      date: null,
    };
  };

  const insertCharges = async (activePeople, year, month, amount) => {
    let chargesInsert = [];
    activePeople.map(person => {
      let charge = prepareCharge(year, month, amount, person);
      chargesInsert.push(charge);
    });

    const res = await Charge.create(chargesInsert).catch(err => {
      return responseHelper.buildError(`error inserting charges: ${err}`, 500);
    });
    return responseHelper.buildResponse(res, 201);
  };

  Charge.createForMonth = async (params, cb) => {
    const month = params.month.toUpperCase();
    const year = params.year;
    let monthYear = `${month} ${year}`;
    let Place = Charge.app.models.Place;
    let Person = Charge.app.models.Person;
    let OtherCharge = Charge.app.models.OtherCharge;

    const existingCharges = await getExistingCharges(month, year);
    if (existingCharges.length > 0) {
      let message = `charges already found for ${monthYear}: nothing done`;
      return responseHelper.buildResponse(message);
    }

    let allOtherCharges = await OtherCharge.find(isActiveFilter).catch(err => {
      return responseHelper.buildError(`error finding other charges: ${err}`, 500);
    });

    let total = await getPlacesTotal(Place);
    total += await getPeopleOtherBanksTotal(Person, allOtherCharges);
    total += getOtherChargesTotal(allOtherCharges);

    let activePeople = await getActivePeople(Person);
    const amount = total / activePeople.length;
    return await insertCharges(activePeople, year, month, amount);
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
      type: 'object',
    },
  });
};
