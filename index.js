#!/usr/bin/env nodejs

'use strict';

const assert = require('assert');
const process = require('process');
const Path = require('path');

const serve = require('./src/server/serve');

function usage() {
  console.error(`usage: ${Path.basename(process.argv[1])} ` +
		`PORT COURSES_DIR`);
  process.exit(1);
}

function getPort(portArg) {
  let port = Number(portArg);
  if (!port) usage();
  return port;
}

async function go(args) {
  try {
    const port = getPort(args[0]);
    const dir = args[1];
    serve(port, __dirname, dir);
  }
  catch (err) {
    console.error(err);
  }
}
    

if (process.argv.length != 4) usage();
go(process.argv.slice(2));
