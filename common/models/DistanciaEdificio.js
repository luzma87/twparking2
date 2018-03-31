'use strict';

module.exports = (DistanciaEdificio) => {
  DistanciaEdificio.disableRemoteMethodByName('deleteById');
};
