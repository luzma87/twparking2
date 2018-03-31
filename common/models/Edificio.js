'use strict';

module.exports = function(Edificio) {
  Edificio.disableRemoteMethodByName("deleteById");
  Edificio.disableRemoteMethodByName('prototype.__destroyById__puestos');
  Edificio.disableRemoteMethodByName('prototype.__delete__puestos');
};
