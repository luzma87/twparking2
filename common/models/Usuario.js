'use strict';

module.exports = function(Usuario) {
  Usuario.disableRemoteMethodByName("deleteById");
};
