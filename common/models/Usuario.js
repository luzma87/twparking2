'use strict';

module.exports = function(Usuario) {
  Usuario.disableRemoteMethodByName("deleteById");

  Usuario.disableRemoteMethodByName('prototype.__destroyById__autos');
  Usuario.disableRemoteMethodByName('prototype.__delete__autos');
};
