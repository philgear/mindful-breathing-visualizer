const { app, BrowserWindow, Tray, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 420, // Mobile-like width
    height: 680, // Tall enough for settings
    show: false,
    frame: true, // Enable standard frame for moving/closing since we lost custom header
    fullscreenable: false,
    resizable: true, // Allow resizing to test responsiveness
    transparent: false, // Standard window
    webPreferences: {
      // SECURITY: Disable Node integration and enable context isolation to prevent RCE
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the canonical "docs" artifact which serves as the single source of truth
  const docsPath = path.join(__dirname, '../../docs/index.html');
  mainWindow.loadFile(docsPath);

  // Hide the window when it loses focus
  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });
};

const toggleWindow = () => {
  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
};

const showWindow = () => {
  const position = getWindowPosition();
  mainWindow.setPosition(position.x, position.y, false);
  mainWindow.show();
  mainWindow.focus();
};

const getWindowPosition = () => {
  const windowBounds = mainWindow.getBounds();
  const trayBounds = tray.getBounds();

  // Center window horizontally below the tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2);
  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  return { x: x, y: y };
};

app.whenReady().then(() => {
  // Create a simple icon (placeholder)
  // In a real app, you'd load an image file
  const icon = nativeImage.createFromPath(path.join(__dirname, 'icon.png'));

  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Mindful Breathing');

  // For now, if no icon, just setting a title might not work on all OS trays,
  // but the click handler is what matters.
  tray.setTitle('🧘');

  tray.on('click', toggleWindow);

  createWindow();
});

// Don't show in dock
if (process.platform === 'darwin') {
  app.dock.hide();
}
