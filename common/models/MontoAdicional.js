'use strict';

module.exports = function(MontoAdicional) {
  MontoAdicional.disableRemoteMethodByName("deleteById");
};