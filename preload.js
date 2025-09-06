const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	selectCsv: () => ipcRenderer.invoke('select-file'),
	selectOutputFolder: () => ipcRenderer.invoke('select-folder'),
	startGeneration: (paths) => ipcRenderer.invoke('start-generation', paths)
});