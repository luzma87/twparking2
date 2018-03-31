'use strict';

module.exports = (AsignacionPuesto) => {
  AsignacionPuesto.disableRemoteMethodByName('deleteById');
};
