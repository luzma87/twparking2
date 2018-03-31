'use strict';

module.exports = function(Auto) {
  Auto.disableRemoteMethodByName("deleteById");
};