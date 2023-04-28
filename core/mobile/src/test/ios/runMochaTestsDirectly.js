/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

"use strict";

// Run selected backend mocha tests programmatically. We do this in the mobile platform.
require("mocha"); // puts the symbol "mocha" in global.
require("chai"); // puts 'assert', etc. into global

const configs = eval('require("./config.json");');
process.env = { ...process.env, ...configs };

const xunit = require("mocha/lib/reporters/xunit");
function MobileReporter(runner) {
  Mocha.reporters.Base.call(this, runner);
  var stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 };
  var indents = 1;
  var failedTest = [];
  runner.stats = stats;
  function indent() {
    return Array(indents).join("  ");
  }
  function log(type, msg) {
    // Following send a event to UI and write the log message in a text view
    process.mocha_log("MOCHA", msg);
    // replace special char and replaced it with string for logging and filtering purpose
    let plainMsg = msg
      .replace("λ", "[*]")
      .replace("✔", "[PASSED]")
      .replace("✘", "[FAILED]");

    // remove \n from the front of the string
    let i = 0;
    while (plainMsg[i] === "\n") {
      i++;
    }
    plainMsg = plainMsg.substring(i);
    if (type === "info") {
      process.log("MOCHA INFO", plainMsg);
    } else {
      process.log("MOCHA ERROR", plainMsg);
    }
  }
  runner.on("suite", function (suite) {
    stats.suites = stats.suites || 0;
    if (suite.root) return;
    stats.suites++;
    log("info", `\n${indent()} λ ${suite.title}`);
    indents++;
  });
  runner.on("suite end", function (suite) {
    indents--;
  });
  runner.on("pending", function (test) {
    stats.pending++;
  });
  runner.on("test", function (test) {});
  runner.on("pass", function (test) {
    stats.passes = stats.passes || 0;
    var medium = test.slow() / 2;
    test.speed =
      test.duration > test.slow()
        ? "slow"
        : test.duration > medium
        ? "medium"
        : "fast";
    stats.passes++;
    log(
      "info",
      `${indent()} ✔ ${test.title}  (${test.speed}) ${test.duration} ms`
    );
  });
  runner.on("fail", function (test, err) {
    stats.failures++;
    log("error", `${indent()} ✘ ${test.title}`);
    test.err = err;
    if (err.message && err.message.length > 0) {
      log("error", `${indent()}    ${err.message}`);
    } else {
      if (err.expected && err.actual) {
        log(
          "error",
          `${indent()} Expected: ${err.expected}, Actual: ${err.actual} ${
            err.message
          }`
        );
      }
    }
    failedTest.push(test);
  });
  runner.on("start", function () {
    stats.start = new Date();
  });
  runner.on("end", function () {
    stats.end = new Date();
    stats.duration = (stats.end.getTime() - stats.start.getTime()) / 1000;
    log("info", `\n${stats.passes} Passes`);
    log("info", `\n${stats.failures} Failures`);
    log("info", `\n${stats.pending} Pending`);
    log(
      "info",
      `\nDone ${stats.passes} / ${stats.passes + stats.failures} (${
        stats.duration
      } seconds)`
    );
    process.mocha_complete();

    if (failedTest.length > 0) {
      log(
        "error",
        `\n=========================[errors]=========================`
      );
      for (const test of failedTest) {
        log("error", `\n${indent()} ✘ ${test.title}`);
        if (test.err.expected && test.err.actual) {
          log(
            "error",
            `${indent()} Expected: ${test.err.expected}, Actual: ${
              test.err.actual
            }`
          );
        }
        if (test.err.stack) {
          log("error", `${indent()} Trace: ${test.err.stack}`);
        }
      }
      log(
        "error",
        `\n=========================[errors]=========================`
      );
    }
  });
}

mocha.setup({
  ui: "bdd",
  reporter: MobileReporter,
  // WIP we need these arg to come from ios launchArguments
  timeout: 9999999,
  grep: require("./ignoreTest.js").join("|"),
  invert: true,
}); // puts 'describe', 'it', etc. into global

require("./IModelTestUtils.js");

// following file is generated by npm script
require("./ios-test-barrel.js");

mocha.run();
