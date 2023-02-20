"use strict";

function init(projectName, opts) {
  console.log("test", projectName, opts.force, process.env.CLI_TARGET_PATH);
}

module.exports = init;
