'use strict';

module.exports = (PagoPuesto) => {
  PagoPuesto.disableRemoteMethodByName('deleteById');
};
