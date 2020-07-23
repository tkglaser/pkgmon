# pkgmon

Automatically updates node packages whenever the lock file changes in the repository.

[![NPM](https://nodei.co/npm/pkgmon.png)](https://nodei.co/npm/pkgmon/)

## Why?

When you pull new code from a repository, it's easy to forget that you might need to run `npm install` (or `npm ci`) because somebody might have added or upgraded a package reference. `pkgmon` checks this for you and automatically runs `npm ci`.

`pkgmon` isn't just running a `npm ci` every time, it smartly tracks changes to your `package-lock.json` and only runs `npm ci` when necessary.

## How it works

`pkgmon` calculates the md5 checksum of your local `package-lock.json` and saves that checksum to disk. Before you run your code, it checks the `package-lock.json` against the saved checksum and runs an `npm ci` if they are different.

Click to watch the demo video 👇

[![demo video](https://img.youtube.com/vi/0acu1BjOJLI/0.jpg)](https://www.youtube.com/watch?v=0acu1BjOJLI)

## How to add `pkgmon` to your project

1. Add `pkgmon` as a library (or dev-library) to your project:
```bash
npm i -D pkgmon
```
2. Add a `pkgmon` check to your start script in `package.json`
```json
{
  "scripts": {
    "start": "pkgmon run && your-start-script"
  }
}
```
3. Add `package.md5` to your `.gitignore`. This file should only be local.

## Documentation

To use pkgmon on the command line outside of the `package.json`, it needs to be installed globally:
```bash
npm install -g pkgmon
```
Depending on your OS you might have to `sudo` the above command.

`pkgmon` supports the following commands:

### `pkgmon run`

This command compares the local checksum against the `package-lock.json`. If they differ or no checksum is saved, it will perform an `npm ci`. Use this command each time before you run your project

### `pkgmon reset`

Use this command if you know that an `npm ci` is not required. It will set the checksum to the current `package-lock.json`. Use this command after you installed a new package locally.

### `pkgmon check`

This works the same as `pkgmon run` except it will not execute the `npm ci` but only report it on the console. A dry run if you like.

### `pkgmon install`

Runs an `npm install` and saves the checksum. This is a good command for initial setup.
