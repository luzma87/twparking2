'use strict';

module.exports = function(Edificio) {
  Edificio.disableRemoteMethodByName("deleteById");
};