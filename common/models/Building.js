'use strict';

module.exports = function(Building) {
  Building.disableRemoteMethodByName('deleteById');
  Building.disableRemoteMethodByName('prototype.__destroyById__places');
  Building.disableRemoteMethodByName('prototype.__delete__places');
};
