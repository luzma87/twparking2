'use strict';

let path = require('path');

let app = require(path.resolve(__dirname, '../server/server'));
let ds = app.datasources.twparking;
ds.discoverSchema('auto', {schema: 'public'}, function(err, schema) {
  if (err) throw err;

  let json = JSON.stringify(schema, null, '  ');
  console.log(json);

  ds.disconnect();
});
