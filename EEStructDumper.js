'use strict';

const debug = require('debug')('EEDumper');

const toConstName = (prefix, suffix) => prefix + '_' + suffix.replace(' ', '_').toUpperCase().replace('__', '_');
const toConstId = (prefix, suffix) => prefix + (prefix ? '_' : '') + suffix;
const buildDefinition = (prefixKey, rawKey, prefixId, rawId, reverse = true) => {
  let definition = {
    key: toConstName(prefixKey, rawKey),
    rawKey: rawKey,
    id: toConstId(prefixId, rawId),
    rawId: rawId,
    strings: {}
  };

  definition.strings.toComprehensive = `${definition.key} = '${definition.id}';`;
  definition.strings.toMindFuck = (reverse ? `\n${definition.id.toUpperCase()} = '${definition.key}';` : '');

  definition.asString = `${definition.strings.toComprehensive}${definition.strings.toMindFuck}`;

  return definition;
};

class EEStructDumper {
  constructor(connection) {
    this.connection = connection;
  }

  query(query) {
    return new Promise((resolve, reject) => {
      this.connection.query(query, (err, rows, fields) => {
        if(err) return reject(err);

        return resolve(rows, fields);
      })
    })
  }

  describeTable(table) {
    let query = `SHOW COLUMNS FROM ${table}`;

    return this.query(query);
  }

  dump() {
    return Promise.all([
      this.dumpChannels(),
      this.dumpChannelsFields(),
      this.dumpFieldGroups(),
      this.dumpMatrixCols()
    ]);
  }



  dumpChannels() {
    debug('DUMP CHANNELS');
    let query = `SELECT channel_id, channel_name FROM exp_channels`;

    return this.query(query)
      .then((results) => {
        debug(`CHANNELS: ${results.length}`);

        let _results = results.map((item, index) => buildDefinition('CHANNEL', item.channel_name, '', item.channel_id, false));
        return Promise.resolve(_results);
      });
  }

  dumpChannelsFields() {
    debug('DUMP CHANNEL FIELDS');
    let query = `SELECT field_id, field_name from exp_channel_fields`;

    return this.query(query)
      .then((results) => {
          debug(`CHANNEL FIELDS: ${results.length}`);

          let _results = results.map((item, index) => buildDefinition('CHANNEL_FIELD', item.field_name, 'field_id', item.field_id));
          return Promise.resolve(_results);
      })
  }

  dumpFieldGroups()  {
      debug('DUMP FIELD GROUPS');
      let query = `SELECT group_id, group_name FROM exp_field_groups`;

      return this.query(query)
        .then((results) => {
            debug(`FIELD GROUPS: ${results.length}`);

            let _results = results.map((item, index) => buildDefinition('FIELD_GROUP', item.group_name, 'group_id', item.group_id));
            return Promise.resolve(_results);
        });
  }

  dumpMatrixCols() {
    debug('DUMP MATRIX COLS');
    let query = `SELECT col_name, col_id FROM exp_matrix_cols`;

    return this.query(query)
      .then((results) => {
        debug(`MATRIX COLS: ${results.length}`)

        let _results = results.map((item, index) => buildDefinition('MATRIX_COL', item.col_name, 'col_id', item.col_id));
        return Promise.resolve(_results);
      });
  }
}

module.exports = EEStructDumper;
