import * as AutoLaunch from 'auto-launch'
import { app, ipcMain, BrowserWindow, Menu, Notification, Tray } from 'electron'
import { enableLiveReload } from 'electron-compile'
import installExtension, {
  REACT_DEVELOPER_TOOLS
} from 'electron-devtools-installer'
import * as log from 'electron-log'
import * as Store from 'electron-store'
import { noop } from 'lodash'
import * as open from 'opn'
import { dirname, join } from 'path'
import { cli } from './cli'
import { config } from './config/index'
import {
  IPC_GATHERING_CLI_RESTART,
  IPC_GATHERING_CLI_UPLOAD,
  IPC_GATHERING_OPEN_LOG_DIR
} from './constants'
import { GatheringConfig } from './store'
import { HasUpdate } from './update'

// Squirrel installer launches the app during installation, but we
// don't need that, or want the app to show, so stop.
// tslint:disable-next-line:no-require-imports no-var-requires
if (require('electron-squirrel-startup')) {
  return app.quit()
}

// Log level is `warn` by default, we want more logs during the beta period
// for easier debugging.
log.transports.file.level = 'verbose'
// TODO: This can probably be removed with logging above
process.env.ELECTRON_ENABLE_LOGGING = 1

log.warn('Gathering.gg Client startup: Version:', app.getVersion())
log.warn('Gathering.gg Client startup: Platform:', process.platform)

// TODO: Remove
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null
let tray: Electron.Tray | null = null

// If another instance of the app is running, stop.
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  return app.quit()
}

const isDevMode = process.execPath.match(/[\\/]electron/)
if (isDevMode) {
  enableLiveReload({ strategy: 'react-hmr' })
}

// Gathering.gg Configuration
const store = new Store<GatheringConfig>()

const createWindow = async () => {
  const icon = join(__dirname, 'images', 'icon', 'icon.icns')
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Gathering.gg',
    icon,
    width: isDevMode ? 1000 : 400,
    height: isDevMode ? 1000 : 700,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Open the DevTools.
  if (isDevMode) {
    await installExtension(REACT_DEVELOPER_TOOLS)
    mainWindow.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  const template = [
    {
      label: 'Application',
      submenu: [
        {
          label: 'About Application',
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          selector: 'selectAll:'
        }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// Function for Showing/Hiding main window
const showHide = (show: boolean = false) => {
  if (!mainWindow) {
    return createWindow()
  }
  if (mainWindow.isVisible()) {
    if (!show) {
      return mainWindow.hide()
    }
    mainWindow.show()
  }
}

// Setup the tray icon and show/hide of our app
const createTray = () => {
  const user = store.get('user')
  const icon = join(__dirname, 'images', 'tray', 'icon.png')
  tray = new Tray(icon)

  // User specific menu, only if they are logged in
  const site = user
    ? [
        { type: 'separator' },
        {
          label: 'Profile',
          click() {
            open(`${config.web}/${user.username}`)
          }
        },
        {
          label: 'Decks',
          click() {
            open(`${config.web}/${user.username}/decks`)
          }
        },
        {
          label: 'Matches',
          click() {
            open(`${config.web}/${user.username}/matches`)
          }
        }
      ]
    : []

  // Tray Menu
  const contextMenu = Menu.buildFromTemplate(
    [
      { role: 'quit' },
      {
        label: 'Show',
        click() {
          showHide(true)
        }
      }
    ].concat(site)
  )
  tray.setContextMenu(contextMenu)

  tray.on('right-click', showHide)
  tray.on('double-click', showHide)
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
}

const checkForUpdates = async () => {
  const hasUpdate = await HasUpdate()
  if (hasUpdate) {
    const note = new Notification({
      title: 'Update Available',
      body: 'Please download the new update.'
    })
    note.on('click', () => {
      open('https://github.com/gathering-gg/client/releases')
    })
    note.show()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('ready', createTray)
app.on('ready', checkForUpdates)

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('window-all-closed', noop)

// Setup Autolaunch on Login if not dev
if (!isDevMode) {
  const gatheringLauncher = new AutoLaunch({
    name: 'Gathering',
    isHidden: true
  })
  gatheringLauncher.enable()
}

// Start Parsing the log file if the user has a token saved
// The store only broadcasts changes on the same thread, so this
// will not be able to listen to the login events and start parsing.
// Instead it's called from the IPC when the login happens.
const startParsing = async () => {
  const token = store.get('token')
  if (token) {
    log.info('Store had token on startup, start parsing.')
    const file = store.get('file')
    const timer = store.get('timer')
    cli.start({ file, timer, token })
  }
}

startParsing()

// Run Commands
ipcMain.on(IPC_GATHERING_OPEN_LOG_DIR, (event, arg) => {
  open(dirname(log.transports.file.file))
})

ipcMain.on(IPC_GATHERING_CLI_RESTART, () => {
  const token = store.get('token')
  if (token) {
    cli.stop()
    const file = store.get('file')
    const timer = store.get('timer')
    cli.start({ file, timer, token })
  }
})

ipcMain.on(IPC_GATHERING_CLI_UPLOAD, () => {
  const token = store.get('token')
  if (token) {
    cli.upload(token)
  }
})
