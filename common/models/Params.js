'use strict';

module.exports = function(Params) {
  Params.disableRemoteMethodByName('deleteById');
};
