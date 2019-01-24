# Gathering.gg Client #

This repo contains a user interface for handling the parsing of Magic: The
Gathering Arena `output_log.txt` files. The actual parsing is handled by the
[Parser](https://github.com/gathering-gg/parser) library. However, that library
is a command line utility and not very user friendly (unless you love
Powershell).

The Electron app also handles most of the operating system hooks we want our
tracker to have, such as starting on login, tray icon, and notifications.

## Get Started ##
Download the latest release: https://github.com/gathering-gg/client/releases

**Note:** It does not currently auto update, but when it does, it will still
use GitHub releases to check for updates.

Unzip the app and install it. Go to [Gatherin.gg](https://gathering.gg) to get
your account token and input it into the app. You're good to go!

## Development ##
Client uses [Electron Forge](https://electronforge.io/) to handle the Electron lifecycle. You'll want to install it to develop locally.

```
$ npm install -g electron-forge
```

Clone the repo and install dependencies
```
$ git@github.com:gathering-gg/client.git && cd client
$ yarn
```
**Note:** We use Yarn for dependency management in this app, do not run `npm install`

Run Local:
```
$ make
```

The app has a configuration file that is changed between dev/prod depending on the Make command being run. This configuration file changes the root url the app talks to and may be of interest to chage.

Lint:
```
yarn lint
```

## Contributing ##
Please feel free to submit issues and pull requests!
