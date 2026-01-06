const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        backgroundColor: '#0a0a0f',
        webPreferences: {
            preload: path.join(__dirname, '../preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
        frame: true,
        titleBarStyle: 'default',
        icon: path.join(__dirname, '../../build/icon.ico')
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle user lookup
ipcMain.handle('lookup-user', async (event, searchType, searchValue, options) => {
    const { performLookup } = require('../core/lookup');

    // Progress callback to send updates to renderer
    const progressCallback = (message) => {
        event.sender.send('lookup-progress', { message });
    };

    try {
        const result = await performLookup(searchType, searchValue, options, progressCallback);

        if (result.success) {
            event.sender.send('lookup-complete', result.data);
            return {
                success: true,
                data: result.data
            };
        } else {
            event.sender.send('lookup-error', result.error);
            return {
                success: false,
                error: result.error,
                data: result.data
            };
        }
    } catch (error) {
        const errorMsg = error.message || 'An unexpected error occurred';
        event.sender.send('lookup-error', errorMsg);
        return {
            success: false,
            error: errorMsg
        };
    }
});

// Handle saving results
ipcMain.handle('save-results', async (event, data, filename) => {
    try {
        const resultsDir = path.join(__dirname, '../../results');

        // Create results directory if it doesn't exist
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir, { recursive: true });
        }

        const filepath = path.join(resultsDir, filename);
        fs.writeFileSync(filepath, JSON.stringify(data, null, 4));

        return {
            success: true,
            path: filepath
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
});
