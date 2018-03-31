'use strict';

module.exports = (Auto) => {
  Auto.disableRemoteMethodByName('deleteById');
};
