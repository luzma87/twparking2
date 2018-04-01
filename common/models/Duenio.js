'use strict';

module.exports = (Duenio) => {
  Duenio.disableRemoteMethodByName('deleteById');
};
