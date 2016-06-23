'use strict';

const mysql = require('mysql');
const EEStructDumper = require('./EEStructDumper');

const dumper = new EEStructDumper(mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  database : 'expressionengine-db',
  port     : 3306
}));

dumper.dump()
  .then((results) => {
    dumper.connection.end();

    console.log('const SQL = {};\n');

    for(let i = 0, c = (results.length - 1); i <= c; i++) {
      console.log('\n');
      if(results[i]) {
        for(let ii = 0, cc = (results[i].length - 1); ii <= cc; ii++) {
          console.log('SQL.' + results[i][ii].strings.toComprehensive);
        }
      }
    }

    for(let i = 0, c = (results.length - 1); i <= c; i++) {
      console.log('\n');
      if(results[i]) {
        for(let ii = 0, cc = (results[i].length - 1); ii <= cc; ii++) {
          (results[i][ii].strings.toMindFuck ? console.log('SQL.' + results[i][ii].strings.toMindFuck) : '');
        }
      }
    }

    console.log('\nmodule.exports = SQL;');
  })
  .catch(console.log);
