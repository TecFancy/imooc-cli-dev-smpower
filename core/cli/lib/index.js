"use strict";

module.exports = core;

const semver = require("semver");
const colors = require("colors/safe");
const log = require("@smpower-cli/log");

const constant = require("./const");
const pkg = require("../package.json");

function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
  } catch (e) {
    log.error(e.message);
  }
}

function checkNodeVersion() {
  // 1. 获取当前版本号
  const currentVersion = process.version;
  // 2. 对比最低版本号
  const lowestVersion = constant.LOWEST_NODE_VERSION;
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`smpower-cli 需要安装${lowestVersion}以上版本的 Node.js`)
    );
  }
}

function checkPkgVersion() {
  console.log(pkg.version);
  log.notice("cli", pkg.version);
}
