'use strict';

module.exports = function(AsignacionPuesto) {
  AsignacionPuesto.disableRemoteMethodByName("deleteById");
};