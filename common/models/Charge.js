'use strict';

module.exports = function(Charge) {
  Charge.disableRemoteMethodByName('deleteById');
};
