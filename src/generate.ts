#!/usr/bin/env node

const {
  createWriteStream, unlinkSync, readdirSync, renameSync,
} = require('fs');
const request = require('request');
const extract = require('extract-zip');
const { join } = require('path');
const { execSync } = require('child_process');

const runCommand = (cmd: String) => {
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to execute command '${cmd}'.`);
    console.error(e);
    process.exit(1);
  }
};

const projectName = process.argv[2];

if (!projectName) {
  console.warn('Please specify the project neme, eg `npx create-node-jet mypackage`.');
  process.exit(1);
}

const zipFile = `${projectName}.zip`;
request('https://github.com/node-jet/package-starter/zipball/master')
  .on('error', (err: any) => {
    console.error('Failed to download starter project.');
    console.error(err);
    unlinkSync(zipFile);
    process.exit(1);
  }).on('complete', () => {
    extract(zipFile, { dir: process.cwd() })
      .then(() => {
        const ls = readdirSync(process.cwd());
        ls.forEach((file: string) => {
          if (file.startsWith('node-jet-package-starter-')) {
            renameSync(file, projectName);
          }
        });
        unlinkSync(zipFile);
        process.chdir(join(process.cwd(), projectName));
        runCommand('npm install');
        console.log(`Success! run 'cd ${projectName} get started`);
      })
      .catch((err: any) => {
        console.error('Failed to extract starter project.');
        console.error(err);
        unlinkSync(zipFile);
        process.exit(1);
      });
  }).pipe(createWriteStream(zipFile));
