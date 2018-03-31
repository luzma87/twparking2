'use strict';

let path = require('path');

let server = require(path.resolve(__dirname, '../server/server'));
let ds = server.dataSources.twparking;
let lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
ds.automigrate(lbTables, (er) => {
  if (er) throw er;
  console.log(`Loopback tables [${lbTables}] created in `, ds.adapter.name);
  ds.disconnect();
});
