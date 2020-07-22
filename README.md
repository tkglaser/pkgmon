# pkgmon

Automatically updates node packages whenever the lock file changes in the repository.

## Why?

Usually, when you add a 3rd party package to a node application, the steps are

1. Install the package locally and implement your feature using the package
2. Check it into source control along with the updated `package-lock.json` file
3. Tell all your team members that they need to run `npm ci` next time they pull the code
4. Get questions from the team members that missed the message, why your code isn't working

What if you could automatically run `npm ci` whenever you pull code with an updated `package-lock.json`?

## How it works

`pkgmon` calculates an md5 checksum of your local `package-lock.json` and saves that checksum to disk. Before you run your code, it checks the `package-lock.json` against the saved checksum and runs an `npm ci` if they are different.

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

`pkgmon` supports the following modes:

### `pkgmon run`

This command compares the local checksum against the `package-lock.json`. If they differ or no checksum is saved, it will perform an `npm ci`. Use this command each time before you run your project

### `pkgmon reset`

Use this command if you know that an `npm ci` is not required. It will set the checksum to the current `package-lock.json`. Use this command after you installed a new package locally.

### `pkgmon check`

This works the same as `pkgmon run` except it will not execute the `npm ci` but only report it on the console. A dry run if you like.

### `pkgmon install`

Runs an `npm install` and saves the checksum. This is a good command for initial setup.
