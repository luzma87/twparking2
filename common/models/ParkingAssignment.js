'use strict';

module.exports = function(ParkingAssignment) {
  ParkingAssignment.disableRemoteMethodByName('deleteById');
};
