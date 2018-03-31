'use strict';

module.exports = function(Cobro) {
  Cobro.disableRemoteMethodByName("deleteById");
};