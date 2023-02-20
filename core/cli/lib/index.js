"use strict";

module.exports = core;

const path = require("path");
const semver = require("semver");
const commander = require("commander");
const colors = require("colors/safe");
const userHome = require("user-home");
const log = require("@imooc-cli-dev-smpower/log");
const init = require("@imooc-cli-dev-smpower/init");

const constant = require("./const");
const pkg = require("../package.json");

const program = new commander.Command();

async function core() {
  try {
    await prepare();
    registerCommand();
  } catch (e) {
    log.error(e.message);
  }
}

function registerCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage("<command> [options]")
    .version(pkg.version)
    .option("-d, --debug", "是否开启调试模式", false)
    .option("-tp, --targetPath <targetPath>", "是否指定本地调试文件路径", "")
    .showHelpAfterError();

  program
    .command("init [projectName]")
    .option("-f, --force", "是否强制初始化项目")
    .action(init);

  watchUnknowCmd();
  setTargetPathEnv();

  if (program.args.length < 3) {
    program.outputHelp();
    console.log();
  }

  program.parse(process.argv);

  enableDebugMod();
}

async function prepare() {
  checkPkgVersion();
  checkNodeVersion();
  await rootCheck();
  await checkUserHome();
  await checkEnv();
  await checkGlobalUpdate();
}

// 设置 targetPath 环境变量
function setTargetPathEnv() {
  program.on("option:targetPath", function () {
    process.env.CLI_TARGET_PATH = program.getOptionValue("targetPath");
  });
}

// 监听未知命令
function watchUnknowCmd() {
  program.on("command:*", function (obj) {
    const availableCommands = program.commands.map((cmd) => cmd.name());
    console.log(colors.red(`未知的命令 ${obj[0]}`));
    if (availableCommands?.length) {
      console.log(colors.red(`可用命令 ${availableCommands.join(",")}`));
    }
  });
}

// 开启 的bug 模式
function enableDebugMod() {
  const options = program.opts();
  if (options.debug) process.env.LOG_LEVEL = "verbose";
  else process.env.LOG_LEVEL = "info";
  log.level = process.env.LOG_LEVEL;
  log.verbose("debug mod...");
}

async function checkGlobalUpdate() {
  // 1. 获取当前版本号和模块名
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  // 2. 调用 npm API，获取所有版本号
  const {
    getNpmSemverVersion,
  } = require("@imooc-cli-dev-smpower/get-npm-info");
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    log.warn(
      "发现新版本",
      colors.yellow(
        `请手动更新 ${npmName}，当前版本是 ${currentVersion}，最新版本是 ${lastVersion}\n更新命令 npm install -g ${npmName}`
      )
    );
  }
  // 3. 提取所有版本号，比对哪些版本号大于当前版本号
  // 4. 获取最新的版本号，提示用户更新到该版本
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
