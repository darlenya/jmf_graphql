'use strict';

import path from 'path';
import assert from 'assert';
import fs from 'fs';
import mkdirp from 'mkdirp';


import GraphQLEventHandler from '../lib/GraphQLEventHandler';
import GraphQLSchemaExporter from '../lib/GraphQLSchemaExporter';
import { Logger } from 'jmf';
import { ModelParser } from 'jmf';


const targetDir = path.join(__dirname, './volatile');
prepareDir(targetDir);

const logger = new Logger();

// -------------------------------
// Common
// -------------------------------
const metaModelFile = path.join(__dirname, './fixtures/demo_model.json');
const metaModelContent = fs.readFileSync(metaModelFile);
const metaModel = JSON.parse(metaModelContent);

// -------------------------------
// GraphQL
// -------------------------------
const schemaFile = path.join(targetDir, 'schema.js');
const templateGraphQl = path.join(__dirname, '../resources/graphql_schema.template');

const eventHandlerGraphQl = new GraphQLEventHandler({ logger: logger });
const exporterGraphQl = new GraphQLSchemaExporter({ logger: logger, template: templateGraphQl, fileName: schemaFile });

// -------------------------------
// Run
// -------------------------------

const options = {
  //"event_handler": [eventHandlerGraphQl,eventHandlerTdgImport, eventHandlerTdgExport]
  "event_handler": [eventHandlerGraphQl]
};

const modelParser = new ModelParser(options);
modelParser.parse(metaModel);
modelParser.printErrors();

// -------------------------------
// Export GraphQL
// -------------------------------
const expModel = eventHandlerGraphQl.getModel();
console.log("#####################################");
console.log(JSON.stringify(expModel, null, 2));
console.log("#####################################");
//exporterGraphQl.write(expModel);









/**
 * create the directory if missing
 */
function prepareDir(dir) {
  // Create the target directory if it does not exists
  let stats;
  try {
    stats = fs.lstatSync(dir);
  } catch (err) {
    // do nothing
  }

  if (!stats) {
    // the path does not exists, create it
    mkdirp.sync(dir);
  } else {
    if (!stats.isDirectory()) {
      throw `The given directory '${dir}' is not a directory`;
    }
  }
}
