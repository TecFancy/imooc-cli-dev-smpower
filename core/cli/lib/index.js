"use strict";

module.exports = core;

const log = require('@smpower-cli/log')
const pkg = require("../package.json");

function core() {
  checkPkgVersion();
}

function checkPkgVersion() {
  console.log(pkg.version);
  log.notice('cli', pkg.version)
}
