'use strict';

module.exports = function(DistanciaEdificio) {
  DistanciaEdificio.disableRemoteMethodByName("deleteById");
};