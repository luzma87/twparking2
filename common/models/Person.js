'use strict';

module.exports = function(Person) {
  Person.disableRemoteMethodByName('deleteById');
};
