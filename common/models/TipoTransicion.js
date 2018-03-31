'use strict';

module.exports = function(TipoTransicion) {
  TipoTransicion.disableRemoteMethodByName("deleteById");
};