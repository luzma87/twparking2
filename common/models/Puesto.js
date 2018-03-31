'use strict';

module.exports = function(Puesto) {
  Puesto.disableRemoteMethodByName("deleteById");
};