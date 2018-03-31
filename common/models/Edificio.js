'use strict';

module.exports = (Edificio) => {
  Edificio.disableRemoteMethodByName('deleteById');
  Edificio.disableRemoteMethodByName('prototype.__destroyById__puestos');
  Edificio.disableRemoteMethodByName('prototype.__delete__puestos');
};
