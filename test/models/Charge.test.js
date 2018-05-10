/* eslint-disable no-undef,no-unused-expressions */
'use strict';

const _ = require('lodash');
require('../testHelper');

describe('Charge', () => {
  let sandbox;
  const Charge = app.models.Charge;
  const OtherCharge = app.models.OtherCharge;
  const Person = app.models.Person;
  const Place = app.models.Place;
  describe('createForMonth', () => {
    const month = 'ENERO';
    const year = 2018;

    const createPromise = (contents) => {
      return new Promise((resolve, reject) => {
        resolve(contents);
      });
    };

    beforeEach(() => {
      sandbox = sinon.createSandbox();
    });

    afterEach((done) => {
      app.dataSources.twparking.automigrate(function(err) {
        done(err);
      });
      sandbox.restore();
    });

    it('returns 200 and message when charges exist ' +
      'for given month and year', async () => {
      const findChargeStub = sandbox.stub(Charge, 'find')
        .returns(createPromise([{}]));

      const res = await Charge.createForMonth({month, year}).catch(() => {
      });
      expect(findChargeStub).to.have.been
        .calledWith({where: {month: month, year: year}});
      expect(res).to.deep.equal({
        status: 200,
        result: 'charges already found for ENERO 2018: nothing done',
      });
    });

    it(
      'creates new charges with default value when no other charges exist ' +
      'and there are no people from other banks', async () => {
        const personMock = sandbox.mock(Person);
        const filterOtherBanks = {where: {preferredPaymentMethod: 'OTRO'}};
        const filterAllActive = {where: {isActive: true}};
        const person1 = {id: 1};
        const person2 = {id: 2};
        personMock.expects('find')
          .withArgs(filterOtherBanks)
          .returns(createPromise([]));
        let allPeople = [person1, person2];
        personMock.expects('find')
          .withArgs(filterAllActive)
          .returns(createPromise(allPeople));
        const findChargeStub = sandbox.stub(Charge, 'find')
          .returns(createPromise([]));
        const otherChargesStub = sandbox.stub(OtherCharge, 'find')
          .returns(createPromise([]));
        const place = {price: 10};
        let allPlaces = [place, place, place];
        const placeStub = sandbox.stub(Place, 'find')
          .returns(createPromise(allPlaces));
        const amount = (place.price * allPlaces.length) / allPeople.length;

        const res = await Charge.createForMonth({month, year}).catch(() => {
        });

        expect(findChargeStub).to.have.been
          .calledWith({where: {month: month, year: year}});
        expect(otherChargesStub).to.have.been
          .calledWith({where: {isActive: true}});
        expect(placeStub).to.have.been
          .calledWith({where: {isActive: true}});

        personMock.restore();
        personMock.verify();

        let expectedResult = [
          {
            id: 1,
            year: year,
            month: month,
            amountDefault: amount,
            amountPerson: amount,
            amountPayed: 0,
            personId: 1,
            date: null,
          },
          {
            id: 2,
            year: year,
            month: month,
            amountDefault: amount,
            amountPerson: amount,
            amountPayed: 0,
            personId: 2,
            date: null,
          },
        ];
        expect(res).to.include({
          status: 201,
        });
        expect(res.result.length).to.equal(2);
        expect(res.result[0].__data).to.deep.equal(expectedResult[0]);
        expect(res.result[1].__data).to.deep.equal(expectedResult[1]);
      });

    it(
      'creates new charges with default value when other charges exist ' +
      'and there are people from other banks', async () => {
        const personMock = sandbox.mock(Person);
        const filterOtherBanks = {where: {preferredPaymentMethod: 'OTRO'}};
        const filterAllActive = {where: {isActive: true}};
        const person1 = {id: 1};
        const person2 = {id: 2};
        const person3 = {id: 3};
        let peopleOtherBanks = [person3];
        personMock.expects('find')
          .withArgs(filterOtherBanks)
          .returns(createPromise(peopleOtherBanks));
        let allPeople = [person1, person2, person3];
        personMock.expects('find')
          .withArgs(filterAllActive)
          .returns(createPromise(allPeople));
        const findChargeStub = sandbox.stub(Charge, 'find')
          .returns(createPromise([]));
        let heroku = {isActive: true, amount: 5, code: "HRK"};
        let otherBanks = {isActive: true, amount: 0.5, code: 'OB'};
        const otherChargesStub = sandbox.stub(OtherCharge, 'find')
          .returns(createPromise([otherBanks, heroku]));
        const place = {price: 10};
        let allPlaces = [place, place, place];
        const placeStub = sandbox.stub(Place, 'find')
          .returns(createPromise(allPlaces));
        let allPlacesTotal = place.price * allPlaces.length;
        let otherBanksTotal = peopleOtherBanks.length * otherBanks.amount;
        let amount = (allPlacesTotal + heroku.amount + (otherBanksTotal)) / allPeople.length;
        amount = _.round(amount, 2);

        const res = await Charge.createForMonth({month, year}).catch(() => {
        });

        expect(findChargeStub).to.have.been
          .calledWith({where: {month: month, year: year}});
        expect(otherChargesStub).to.have.been
          .calledWith({where: {isActive: true}});
        expect(placeStub).to.have.been
          .calledWith({where: {isActive: true}});

        personMock.restore();
        personMock.verify();

        let expectedResult = [
          {
            id: 1,
            year: year,
            month: month,
            amountDefault: amount,
            amountPerson: amount,
            amountPayed: 0,
            personId: 1,
            date: null,
          },
          {
            id: 2,
            year: year,
            month: month,
            amountDefault: amount,
            amountPerson: amount,
            amountPayed: 0,
            personId: 2,
            date: null,
          },
          {
            id: 3,
            year: year,
            month: month,
            amountDefault: amount,
            amountPerson: amount,
            amountPayed: 0,
            personId: 2,
            date: null,
          },
        ];
        expect(res).to.include({
          status: 201,
        });
        expect(res.result.length).to.equal(3);
        expect(res.result[0].__data).to.deep.equal(expectedResult[0]);
        expect(res.result[1].__data).to.deep.equal(expectedResult[1]);
      });
  });
});
