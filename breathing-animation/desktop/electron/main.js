const { app, BrowserWindow, Tray, nativeImage } = require('electron');
const path = require('path');

let tray = null;
let mainWindow = null;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 300,
        height: 350,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            // SECURITY: Disable Node integration and enable context isolation to prevent RCE
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadFile('index.html');

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
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
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
