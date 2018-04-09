'use strict';

module.exports = function(Owner) {
  Owner.disableRemoteMethodByName('deleteById');
};
