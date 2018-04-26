'use strict';

module.exports = function(Person) {
  Person.disableRemoteMethodByName('deleteById');

  Person.afterRemote('login', async (ctx, user, next) => {
    if (user) {
      let filter = {
        fields: { password: false, username: false, realm: false },
        where: { id: user.userId },
      };
      let userData = await Person.find(filter);
      user.userData = userData[0];
    }
  });

};
