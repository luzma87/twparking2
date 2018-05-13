'use strict';

module.exports = async (app) => {
  const Person = app.models.Person;
  const Role = app.models.Role;
  const RoleMapping = app.models.RoleMapping;

  console.log('finding existing admins...');
  let admins = await Person.find({where: {isAdmin: true}}).catch(err => {
    console.log("ERROR finding admins", err);
  });

  if (admins.length === 0) {
    console.log('none found... creating new...');
    const admin = await Person.create({
      username: 'luzma',
      name: 'Luz',
      isAdmin: true,
      isActive: true,
      idNumber: '1234567890',
      email: 'luzma_87@yahoo.com',
      password: 'superSafe',
    }).catch(err => {
      console.log("ERROR creating admin", err);
    });
    admins = [admin];
  } else {
    console.log('admins already found');
  }

  console.log('finding admin role');
  let roleAdmin = await Role.find({where: {name: 'admin'}}).catch(err => {
    console.log("ERROR finding admin role", err);
  });
  if (roleAdmin.length === 0) {
    console.log('none found... creating new...');
    roleAdmin = await Role.create({name: 'admin'}).catch(err => {
      console.log("ERROR creating admin role", err);
    });
    roleAdmin = [roleAdmin];
  }

  console.log('finding user role');
  let roleUser = await Role.find({where: {name: 'user'}}).catch(err => {
    console.log("ERROR finding user role", err);
  });
  if (roleUser.length === 0) {
    console.log('none found... creating new...');
    roleUser = await Role.create({name: 'user'}).catch(err => {
      console.log("ERROR creating user role", err);
    });
    roleUser = [roleUser];
  }

  console.log('finding admin mappings');
  let roleMappings = await RoleMapping.find({
    where: {
      principalId: admins[0].id,
      roleId: roleAdmin[0].id,
    },
  }).catch(err => {
    console.log("ERROR finding admin mapping", err);
  });

  if (roleMappings.length === 0) {
    console.log('none found... creating new...');
    let mapping = await roleAdmin[0].principals.create({
      principalType: RoleMapping.USER,
      principalId: admins[0].id,
    }).catch(err => {
      console.log("ERROR creating admin mapping", err);
    });
  }

  console.log('finding existing admins...');
  let nonAdmins = await Person.find({where: {isAdmin: false}}).catch(err => {
    console.log("ERROR finding non admins", err);
  });

  console.log('finding user mappings');
  let roleUserMappings = await RoleMapping.find({
    where: {
      roleId: roleUser[0].id,
    },
  }).catch(err => {
    console.log("ERROR finding user mapping", err);
  });

  if (roleUserMappings.length === 0) {
    console.log('none found... creating new...');
    const mappingsCreate = [];
    nonAdmins.map(user => {
      const mapping = {
        principalType: RoleMapping.USER,
        principalId: user.id,
        roleId: roleUser[0].id,
      };
      mappingsCreate.push(mapping);
    });
    let mappings = await RoleMapping.create(mappingsCreate).catch(err => {
      console.log("ERROR creating user mappings", err);
    });
  }
};
