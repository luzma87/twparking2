'use strict';

module.exports = function(Place) {
  Place.disableRemoteMethodByName('deleteById');
};
