'use strict';

module.exports = (Cobro) => {
  Cobro.disableRemoteMethodByName('deleteById');
};
