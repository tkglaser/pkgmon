#!/usr/bin/env node

import * as crypto from "crypto";
import * as fs from "fs";
import { exec } from "child_process";
import * as program from "commander";
const boxen = require("boxen");
const colours = require("colors");

function handleError(err: any) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
}

function md5(str: string) {
  return crypto
    .createHash("md5")
    .update(str, "utf8")
    .digest("hex");
}

function calculateHash(): Promise<string> {
  return new Promise(resolve =>
    fs.readFile("package-lock.json", (err, data) => {
      handleError(err);
      resolve(md5(data.toString("utf8")));
    })
  );
}

function readHash() {
  return new Promise(resolve => {
    fs.readFile("package.md5", (err, data) => {
      if (err && err.code === "ENOENT") {
        resolve("");
        return;
      }
      handleError(err);
      resolve(data.toString("utf8"));
    });
  });
}

function saveHash(hash: string) {
  return new Promise(resolve => {
    fs.writeFile("package.md5", hash, err => {
      handleError(err);
      resolve();
    });
  });
}

async function npmInstall() {
  return new Promise(resolve => {
    console.log("pkgmon: Restoring packages...");
    exec("npm ci", (err, stdout, stderr) => {
      handleError(err);
      console.warn(stderr);
      console.log(stdout);
      console.log(colours.green("pkgmon: Package restore complete."));
      resolve();
    });
  });
}

async function check() {
  const currentHash = await calculateHash();
  const oldHash = await readHash();
  if (currentHash !== oldHash) {
    console.log(
      boxen(
        "pkgmon: Change in package-lock.json detected. " +
          colours.bold("Please run ") +
          colours.underline.bold("pkgmon install") +
          colours.bold("!"),
        {
          padding: 1,
          borderStyle: "double"
        }
      )
    );
    process.exit(-1);
  } else {
    console.log(
      colours.green("pkgmon: No change in package-lock.json detected.")
    );
  }
}

async function run() {
  const currentHash = await calculateHash();
  const oldHash = await readHash();
  if (currentHash !== oldHash) {
    console.log(
      "pkgmon: Change in package-lock.json detected. Running npm ci..."
    );
    await npmInstall();
    await saveHash(currentHash);
  } else {
    console.log(
      colours.green("pkgmon: No change in package-lock.json detected.")
    );
  }
}

async function install() {
  await npmInstall();
  await reset();
}

async function reset() {
  const currentHash = await calculateHash();
  await saveHash(currentHash);
  console.log(colours.green("pkgmon: Reset complete."));
}

program.version("0.0.5");

program
  .command("check")
  .description("Checks if an npm install is required but will not execute it.")
  .action(() => check());

program
  .command("run")
  .description(
    "Checks if an npm install is required. If so, it will run the 'npm ci' command."
  )
  .action(() => run());

program
  .command("install")
  .description("Runs an 'npm ci' command and resets pkgmon.")
  .action(() => install());

program
  .command("reset")
  .description(
    "Resets pkgmon to the current installed packages. Use this if you know that an npm install is not required."
  )
  .action(() => reset());

if (process.argv.length < 3) {
  program.help();
} else {
  program.parse(process.argv);
}
