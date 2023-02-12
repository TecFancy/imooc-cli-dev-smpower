"use strict";

module.exports = core;

const path = require("path");
const semver = require("semver");
const colors = require("colors/safe");
const userHome = require("user-home");
const log = require("@smpower-cli/log");

const constant = require("./const");
const pkg = require("../package.json");

let args;
let config;

async function core() {
  try {
    checkPkgVersion();
    checkNodeVersion();
    await rootCheck();
    await checkUserHome();
    checkInputArgs();
    await checkEnv();
  } catch (e) {
    log.error(e.message);
  }
}

async function checkEnv() {
  const dotenv = require("dotenv");
  const dotenvPath = path.resolve(userHome, ".env");
  await import("path-exists").then((result) => {
    if (result.pathExists(dotenvPath)) {
      dotenv.config({ path: dotenvPath });
    }
  });
  createDefaultConfig();
  console.log("环境变量", process.env.CLI_HOME_PATH);
}

function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  };
  if (process.env.CLI_HOME) {
    cliConfig["cliHome"] = path.join(userHome, process.env.CLI_HOME);
  } else {
    cliConfig["cliHome"] = path.join(userHome, constant.DEFAULT_CLI_HOME);
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
}

function checkInputArgs() {
  const minimist = require("minimist");
  args = minimist(process.argv.slice(2));
  checkArgs();
}

function checkArgs() {
  if (args.debug) process.env.LOG_LEVEL = "verbose";
  else process.env.LOG_LEVEL = "info";
  log.level = process.env.LOG_LEVEL;
}

async function checkUserHome() {
  await import("path-exists").then((result) => {
    if (!userHome || !result.pathExists(userHome)) {
      throw new Error(colors.red("当前登陆用户主目录不存在"));
    }
  });
}

async function rootCheck() {
  await import("root-check").then((result) => {
    result.default();
  });
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
  log.notice("cli", pkg.version);
}
