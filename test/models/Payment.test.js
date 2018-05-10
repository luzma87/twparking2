/* eslint-disable no-undef,no-unused-expressions */
'use strict';

require('../testHelper');

describe('Payment', () => {
  let sandbox;
  const Payment = app.models.Payment;
  const Owner = app.models.Owner;
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

    it('returns 200 and message when charges exist for given month and year',
      async () => {
        const findPaymentStub = sandbox.stub(Payment, 'find')
          .returns(createPromise([{}]));

        const res = await Payment.createForMonth({month, year}).catch(() => {
        });
        expect(findPaymentStub).to.have.been
          .calledWith({where: {month: month, year: year}});
        expect(res).to.deep.equal({
          status: 200,
          result: 'payments already found for ENERO 2018: nothing done',
        });
      });

    it('returns 200 and message when payments exist for given month and year',
      async () => {
        const findPaymentStub = sandbox.stub(Payment, 'find')
          .returns(createPromise([{}]));

        const res = await Payment.createForMonth({month, year}).catch(() => {
        });
        expect(findPaymentStub).to.have.been
          .calledWith({where: {month: month, year: year}});
        expect(res).to.deep.equal({
          status: 200,
          result: 'payments already found for ENERO 2018: nothing done',
        });
      });

    it(
      'creates new payments with default value when no other payments exist',
      async () => {
        const findPaymentStub = sandbox.stub(Payment, 'find')
          .returns(createPromise([]));
        let owner1 = {id: 1, places: () => []};
        let owner2 = {id: 2, places: () => []};
        const findOwnersStub = sandbox.stub(Owner, 'find')
          .returns(createPromise([owner1, owner2]));

        const res = Payment.createForMonth({month, year}).catch(() => {
        });
        expect(findPaymentStub).to.have.been
          .calledWith({where: {month: month, year: year}});
        expect(findOwnersStub).to.have.been
          .calledWith({where: {isActive: true}, include: ['places']});

        let expectedResult = [
          {
            id: 1,
            year: year,
            month: month,
            amount: 0,
            ownerId: 1,
            date: null,
          },
          {
            id: 2,
            year: year,
            month: month,
            amount: 0,
            ownerId: 2,
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
  });
});
