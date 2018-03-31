'use strict';

module.exports = function(PagoPuesto) {
  PagoPuesto.disableRemoteMethodByName("deleteById");
};