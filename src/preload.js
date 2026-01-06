const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    lookupUser: (searchType, searchValue, options) =>
        ipcRenderer.invoke('lookup-user', searchType, searchValue, options),

    saveResults: (data, filename) =>
        ipcRenderer.invoke('save-results', data, filename),

    onLookupProgress: (callback) =>
        ipcRenderer.on('lookup-progress', (event, data) => callback(data)),

    onLookupComplete: (callback) =>
        ipcRenderer.on('lookup-complete', (event, data) => callback(data)),

    onLookupError: (callback) =>
        ipcRenderer.on('lookup-error', (event, error) => callback(error))
});
