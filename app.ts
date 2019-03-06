#!/usr/bin/env node

import * as crypto from "crypto";
import * as fs from "fs";
import { exec } from "child_process";
import * as program from "commander";

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
    exec("npm ci", (err, stdout, stderr) => {
      handleError(err);
      console.log("stdout: " + stdout);
      console.log("stderr: " + stderr);
      resolve();
    });
  });
}

async function check(run: boolean) {
  const currentHash = await calculateHash();
  const oldHash = await readHash();
  if (currentHash !== oldHash) {
    if (run) {
      console.log("hash change, installing");
      await npmInstall();
      await saveHash(currentHash);
    } else {
      console.log("change in package-lock.json detected. Please run npm ci.");
      process.exit(-1);
    }
  } else {
    console.log("no change");
  }
}

async function reset() {
  const currentHash = await calculateHash();
  await saveHash(currentHash);
}

program
  .version("0.0.4")

program
  .command("check")
  .description("Checks if an npm install is required. Use the --run option to execute npm ci")
  .option("-r, --run", "If set, will run npm install when required.")
  .action((opts) => check(opts.run));

program
  .command("reset")
  .description(
    "Resets pkgmon to the current installed packages. Use this if you know that an npm install is not required."
  )
  .action(() => reset());

program.parse(process.argv);
