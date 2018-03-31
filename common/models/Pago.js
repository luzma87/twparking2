'use strict';

module.exports = (Pago) => {
  Pago.disableRemoteMethodByName('deleteById');
};
