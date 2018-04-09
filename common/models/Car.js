'use strict';

module.exports = function(Car) {
  Car.disableRemoteMethodByName('deleteById');
};
