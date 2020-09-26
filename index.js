const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      devTools: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('main.html')
  //win.webContents.openDevTools()
}

app.whenReady().then(createWindow)