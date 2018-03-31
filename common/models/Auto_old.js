'use strict';

module.exports = (Auto) => {
  Auto.disableRemoteMethodByName('deleteById');

  Auto.status = (cb) => {
    let currentDate = new Date();
    let currentHour = currentDate.getHours();
    let OPEN_HOUR = 6;
    let CLOSE_HOUR = 20;
    console.log('Current hour is %d', currentHour);
    let response;
    if (currentHour >= OPEN_HOUR && currentHour < CLOSE_HOUR) {
      response = 'We are open for business.';
    } else {
      response = 'Sorry, we are closed. Open daily from 6am to 8pm.';
    }
    cb(null, response);
  };

  Auto.getName = (carId, cb) => {
    Auto.findById(carId, function(err, auto) {
      let response = `Car is ${auto.marca} ${auto.modelo} ${auto.placa}`;
      cb(null, response);
      console.log(response);
    });
  };

  Auto.remoteMethod(
    'getName', {
      description: ["This is a remote method's description :D",
        'This is description line 2'],
      notes: ["This is a remote method's notes :D",
        'This is notes line 2'],
      http: {
        path: '/getName',
        verb: 'get',
      },
      accepts: {
        arg: 'id', type: 'string', http: {source: 'query'},
      },
      returns: {arg: 'name', type: 'string'},
    }
  );

  Auto.remoteMethod(
    'status', {
      http: {
        path: '/status',
        verb: 'get',
      },
      returns: {
        arg: 'status',
        type: 'string',
      },
    }
  );
};

