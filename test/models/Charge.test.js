/* eslint-disable no-undef,no-unused-expressions */
'use strict';

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
      sandbox = sinon.sandbox.create();
    });

    afterEach((done) => {
      app.dataSources.twparking.automigrate(function(err) {
        done(err);
      });
      sandbox.restore();
    });

    it('returns 200 and message when charges exist for given month and year',
      (done) => {
        const findChargeStub = sandbox.stub(Charge, 'find')
          .returns(createPromise([{}]));

        Charge.createForMonth({month, year}, (err, success) => {
          expect(findChargeStub).to.have.been
            .calledWith({where: {month: month, year: year}});
          expect(err).to.be.null;
          expect(success).to.deep.equal({
            status: 200,
            result: 'charges already found for ENERO 2018: nothing done',
          });
          done();
        });
      });

    it(
      'creates new charges with default value ' +
      'when no other charges exist and there are no people from other banks',
      (done) => {
        const personMock = sandbox.mock(Person);
        const filterOtherBanks = {where: {preferredPaymentMethod: 'OTRO'}};
        const filterAllActive = {where: {isActive: true}};
        const person1 = {id: 1};
        const person2 = {id: 2};
        personMock.expects('find')
          .withArgs(filterOtherBanks)
          .returns(createPromise([]));
        personMock.expects('find')
          .withArgs(filterAllActive)
          .returns(createPromise([person1, person2]));
        const findChargeStub = sandbox.stub(Charge, 'find')
          .returns(createPromise([]));
        const otherChargesStub = sandbox.stub(OtherCharge, 'find')
          .returns(createPromise([]));
        const place = {price: 10};
        const placeStub = sandbox.stub(Place, 'find')
          .returns(createPromise([place, place, place]));
        const amount = (place.price * 3) / 2;

        Charge.createForMonth({month, year}, (err, success) => {
          expect(findChargeStub).to.have.been
            .calledWith({where: {month: month, year: year}});
          expect(otherChargesStub).to.have.been
            .calledWith({where: {isActive: true}});
          expect(placeStub).to.have.been
            .calledWith({where: {isActive: true}});

          personMock.restore();
          personMock.verify();

          expect(err).to.be.null;
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
          expect(success).to.include({
            status: 201,
          });
          expect(success.result.length).to.equal(2);
          expect(success.result[0].__data).to.deep.equal(expectedResult[0]);
          expect(success.result[1].__data).to.deep.equal(expectedResult[1]);
          done();
        });
      });
  });
});
