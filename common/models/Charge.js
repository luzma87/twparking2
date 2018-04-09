'use strict';

const responseHelper = require('../responseHelper');

module.exports = function(Charge) {
  Charge.disableRemoteMethodByName('deleteById');

  Charge.createForMonth = async (params, cb) => {
    const month = params.month.toUpperCase();
    const year = params.year;
    let Place = Charge.app.models.Place;
    let Person = Charge.app.models.Person;

    let places = await Place.find({where: {isActive: true}}).catch(err => {
      cb(responseHelper.buildError(`error finding places: ${err}`), 500);
    });

    let total = 0;
    places.map(place => {
      total += place.price;
    });


    console.log(total);
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
