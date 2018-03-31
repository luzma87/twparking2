'use strict';

module.exports = function(TipoPreferencia) {
  TipoPreferencia.disableRemoteMethodByName("deleteById");
};