'use strict';

module.exports = function(BuildingDistance) {
  BuildingDistance.disableRemoteMethodByName('deleteById');
};
