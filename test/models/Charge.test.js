'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;

const app = require('../../server/server');

describe('Charge', () => {
  const Charge = app.models.Charge;
  describe('createForMonth', () => {

    it('returns when there already are charges for the given month and year', (done) => {
      const month = 'ENERO';
      const year = 2018;

      const existingCharge = new Promise((resolve, reject) => {
        resolve([{}]);
      });

      sinon.stub(Charge, 'find').returns(existingCharge);

      Charge.createForMonth({month, year}, (err, success) => {
        expect(err).to.be.null;
        expect(success).to.deep.equal({
          status: 200,
          result: 'charges already found for ENERO 2018: nothing done',
        });
        done();
      });
    });

    // it('counts initially 0', (done) => {
    //   const month = 'ABRIL';
    //   const year = 2018;
    //   Charge.createForMonth({month, year}, (err, success) => {
    //     expect(err).to.be.null;
    //     expect(success).to.deep.equal({status: 201, result: 'inserted'});
    //     done();
    //   });
    // });
  });
});
