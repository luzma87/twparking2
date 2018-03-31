'use strict';

module.exports = (MontoAdicional) => {
  MontoAdicional.disableRemoteMethodByName('deleteById');
};
