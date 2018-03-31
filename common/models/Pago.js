'use strict';

module.exports = function(Pago) {
  Pago.disableRemoteMethodByName("deleteById");
};