'use strict';

let path = require('path');
const fs = require('fs');

let app = require(path.resolve(__dirname, '../server/server'));
let ds = app.dataSources.twparking;

const ignoreMe = ['accesstoken', 'acl', 'role', 'rolemapping', 'user'];

ds.discoverModelDefinitions({views: false}, function(err, tables) {
  tables.map((table) => {
    if (ignoreMe.indexOf(table.name) === -1) {
      ds.discoverSchemas(table.name, {
        owner: table.owner,
        views: true,
        all: true,
        relations: true,
      }, function(err, schema) {
        let wantedSchema = schema[`public.${table.name}`];
        let name = wantedSchema.name;
        let jsonFilename = `common/models/${name}.json`;
        let jsFilename = `common/models/${name}.js`;

        let modelConfig = ` "${name}": {
          "dataSource": "twparking",
          "public": true
        },`;
        console.log(modelConfig);

        let jsonContents = JSON.stringify(wantedSchema, null, '  ');

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
