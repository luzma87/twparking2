'use strict';

module.exports = function(OtherCharge) {
  OtherCharge.disableRemoteMethodByName('deleteById');
};
