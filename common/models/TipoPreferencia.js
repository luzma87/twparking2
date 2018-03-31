'use strict';

module.exports = (TipoPreferencia) => {
  TipoPreferencia.disableRemoteMethodByName('deleteById');
};
