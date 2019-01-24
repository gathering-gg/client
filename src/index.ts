import * as AutoLaunch from 'auto-launch'
import { app, BrowserWindow, Menu, Tray } from 'electron'
import { enableLiveReload } from 'electron-compile'
import installExtension, {
  REACT_DEVELOPER_TOOLS
} from 'electron-devtools-installer'
import * as Store from 'electron-store'
import { join } from 'path'
import { cli } from './cli'
import { GatheringConfig } from './store'

if (require('electron-squirrel-startup')) {
  return app.quit()
}

// TODO: Remove
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true
process.env.ELECTRON_ENABLE_LOGGING = 1

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow | null = null
let tray: Electron.Tray | null = null

const isDevMode = process.execPath.match(/[\\/]electron/)

if (isDevMode) {
  enableLiveReload({ strategy: 'react-hmr' })
}

// Gathering.gg Configuration file
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
}

// Setup the tray icon and show/hide of our app
const createTray = () => {
  console.log('create tray')
  const icon = join(__dirname, 'images', 'tray', 'icon.png')
  tray = new Tray(icon)
  const showHide = () => {
    if (!mainWindow) {
      return createWindow()
    }
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  }

  tray.on('click', showHide)
  tray.on('right-click', showHide)
  tray.on('double-click', showHide)
  if (process.platform === 'darwin') {
    //    app.dock.hide()
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('ready', createTray)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// Setup Autolaunch on Login if not dev
if (!isDevMode) {
  const gatheringLauncher = new AutoLaunch({
    name: 'Gathering',
    isHidden: true
  })
  gatheringLauncher.enable()
}

// Start Parsing the log file if the user has a token saved
const startParsing = async () => {
  const token = store.get('token')
  if (token) {
    cli.start({ token })
  } else {
    store.onDidChange('token', (token: string) => {
      console.log('New Token!', token)
      if (token) {
        cli.start({ token })
      }
    })
  }
}

startParsing()
