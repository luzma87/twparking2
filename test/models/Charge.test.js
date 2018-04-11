'use strict';

const expect = require('chai').expect;

const app = require('../../server/server');

describe('Charge', () => {
  const Charge = app.models.Charge;
  describe('createForMonth', () => {
    // it('counts initially 0', (done) => {
    //   const month = 'ABRIL';
    //   const year = 2018;
    //   Charge.createForMonth({month, year}, (err, success) => {
    //     expect(err).to.be.null;
    //     expect(success).to.deep.equal({status: 200, result: 'pepe'});
    //     done();
    //   });
    // });
  });
});
