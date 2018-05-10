'use strict';

module.getAdmins = async function(Person) {
  console.log('finding existing admins...');
  return await Person.find({where: {isAdmin: true}}).catch(err => {
    console.log("ERROR finding admins", err);
  });
};
module.createAdmin = async function(Person) {
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
  return [admin];
};
module.getRoleAdmin = async function(Role) {
  console.log('finding admin role');
  return await Role.find({where: {name: 'admin'}}).catch(err => {
    console.log("ERROR finding admin role", err);
  });
};
module.createRoleAdmin = async function(Role) {
  console.log('none found... creating new...');
  const roleAdmin = await Role.create({name: 'admin'}).catch(err => {
    console.log("ERROR creating admin role", err);
  });
  return [roleAdmin];
};
module.getRoleUser = async function(Role) {
  console.log('finding user role');
  return await Role.find({where: {name: 'user'}}).catch(err => {
    console.log("ERROR finding user role", err);
  });
};
module.insertRoleUser = async function(Role) {
  console.log('none found... creating new...');
  const roleUser = await Role.create({name: 'user'}).catch(err => {
    console.log("ERROR creating user role", err);
  });
  return [roleUser];
};
module.getRoleMappings = async function(RoleMapping, admins, roleAdmin) {
  console.log('finding admin mappings');
  return await RoleMapping.find({
    where: {
      principalId: admins[0].id,
      roleId: roleAdmin[0].id,
    },
  }).catch(err => {
    console.log("ERROR finding admin mapping", err);
  });
};
module.insertRoleMappings = async function(roleAdmin, RoleMapping, admins) {
  console.log('none found... creating new...');
  return await roleAdmin[0].principals.create({
    principalType: RoleMapping.USER,
    principalId: admins[0].id,
  }).catch(err => {
    console.log("ERROR creating admin mapping", err);
  });
};
module.getNonAdmins = async function(Person) {
  console.log('finding existing non admins...');
  return await Person.find({where: {isAdmin: false}}).catch(err => {
    console.log("ERROR finding non admins", err);
  });
};
module.getRoleUserMappings = async function(RoleMapping, roleUser) {
  console.log('finding user mappings');
  return await RoleMapping.find({
    where: {
      roleId: roleUser[0].id,
    },
  }).catch(err => {
    console.log("ERROR finding user mapping", err);
  });
};
module.insertRoleUserMappings = async function(nonAdmins, RoleMapping, roleUser) {
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
  await RoleMapping.create(mappingsCreate).catch(err => {
    console.log("ERROR creating user mappings", err);
  });
};
module.exports = async (app) => {
  if (app.settings.env !== 'test') {
    const Person = app.models.Person;
    const Role = app.models.Role;
    const RoleMapping = app.models.RoleMapping;

    let admins = await this.getAdmins(Person);
    if (admins.length === 0) {
      admins = await this.createAdmin(Person, admins);
    } else {
      console.log('admins already found');
    }

    let roleAdmin = await this.getRoleAdmin(Role);
    if (roleAdmin.length === 0) {
      roleAdmin = await this.createRoleAdmin(Role);
    }

    let roleUser = await this.getRoleUser(Role);
    if (roleUser.length === 0) {
      roleUser = await this.insertRoleUser(Role);
    }
    let roleMappings = await this.getRoleMappings(RoleMapping, admins, roleAdmin);
    if (roleMappings.length === 0) {
      await this.insertRoleMappings(roleAdmin, RoleMapping, admins);
    }

    let nonAdmins = await this.getNonAdmins(Person);

    let roleUserMappings = await this.getRoleUserMappings(RoleMapping, roleUser);
    if (roleUserMappings.length === 0) {
      await this.insertRoleUserMappings(nonAdmins, RoleMapping, roleUser);
    }
  }
};
