'use strict';

module.exports = (Puesto) => {
  Puesto.disableRemoteMethodByName('deleteById');
};
