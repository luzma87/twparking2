'use strict';

module.exports = function (Params) {
  Params.disableRemoteMethodByName("deleteById");

  Params.doSomething = function (cb) {
    console.log("Doing stuff");

    const p = {textoMail: 'Algo ahi', ascendente: true};

    Params.create(p, (err, obj) => {
      console.log("DONE!");
      console.log(err);
      console.log(obj);
      cb(null, "done");
    });
  };

  Params.remoteMethod(
    'doSomething', {
      http: {
        path: '/doSomething', verb: 'get'
      },
      returns: {
        arg: 'status',
        type: 'string'
      }
    }
  );

};
