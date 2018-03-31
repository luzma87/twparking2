var path = require('path');
const fs = require('fs');

var app = require(path.resolve(__dirname, '../server/server'));
var ds = app.dataSources.twparking;
// ds.discoverAndBuildModels('auto', {
//   schema: 'public',
//   relations: 'all',
//   visited: {},
//   associations: true
// }, function (err, models) {
//   if (err) throw err;

// models.Auto.find(function (err, auto) {
//   if (err) return console.log(err);
//
//   // console.log("\nAuto: ", auto);
//   // Navigate to the product model
//   // Assumes inventory table has a foreign key relationship to product table
//   // auto.usuario(function (err, usuario) {
//   //   console.log("\nUsuario: ", usuario);
//   //   console.log("\n ------------- ");
//   // });
//
//   ds.disconnect();
// });
// });

// ds.discoverSchema('usuario', {owner: 'public'}, function (err, schema) {
//   console.log(JSON.stringify(schema, null, '  '));
// });

// ds.discoverExportedForeignKeys('auto', function (a, b) {
//   console.log(a);
//   console.log(b);

const ignoreMe = ['accesstoken', 'acl', 'role', 'rolemapping', 'user'];

ds.discoverModelDefinitions({views: false}, function (err, tables) {
  tables.map((table) => {
    if (ignoreMe.indexOf(table.name) === -1) {
      ds.discoverSchemas(table.name, {
        owner: table.owner,
        views: true,
        all: true,
        relations: true
      }, function (err, schema) {
        let wantedSchema = schema[`public.${table.name}`];
        let name = wantedSchema.name;
        // if (name === 'Auto') {
        //   console.log(JSON.stringify(wantedSchema, null, '  '));
        // }
        // console.log(name);
        // let name = schema.name;
        let jsonFilename = `common/models/${name}.json`;
        let jsFilename = `common/models/${name}.js`;

        //       let modelConfig = ` "${name}": {
        //   "dataSource": "twparking",
        //   "public": true
        // },`;
        // console.log(modelConfig);

        let jsonContents = JSON.stringify(wantedSchema, null, '  ');
        // if (name.toLowerCase() === 'auto') {
        //   console.log(jsonContents);
        // }
        let jsContents = `'use strict';

module.exports = function(${name}) {
  ${name}.disableRemoteMethodByName("deleteById");
};`;
        fs.writeFile(jsonFilename, jsonContents, (err) => {
          if (err) throw err;
          // console.log(`The file ${jsonFilename} has been saved!`);
        });
        fs.writeFile(jsFilename, jsContents, (err) => {
          if (err) throw err;
          // console.log(`The file ${jsFilename} has been saved!`);
        });
      });
    }
  });
});

ds.disconnect();
