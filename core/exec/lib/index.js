"use strict";

const Package = require("@imooc-cli-dev-smpower/package");

function exec() {
  const pkg = new Package();
  console.log("pkg", pkg);
  console.log("test", process.env.CLI_TARGET_PATH);
}

module.exports = exec;
