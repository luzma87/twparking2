'use strict';

module.exports = (TipoTransicion) => {
  TipoTransicion.disableRemoteMethodByName('deleteById');
};
